'use client';

import { useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '@/stores/chatStore';
import { useStreamingResponse } from './useStreamingResponse';
import { Message } from '@/types/chat';
import * as chatStorage from '@/lib/storage/chats';
import { generateChatTitle } from '@/lib/api/chat';
import { DEFAULT_MODEL } from '@/lib/constants';

interface UseChatOptions {
  onError?: (error: Error) => void;
}

export function useChat(options?: UseChatOptions) {
  const {
    currentChatId,
    messages,
    isStreaming,
    streamingContent,
    activeAgentId,
    currentModel,
    isModelLoaded,
    setCurrentChat,
    addMessage,
    setStreaming,
    setStreamingContent,
    clearMessages,
  } = useChatStore();

  const { streamResponse, stopStreaming } = useStreamingResponse({
    onChunk: (_, fullContent) => {
      setStreamingContent(fullContent);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  // Load chat when ID changes
  const loadChat = useCallback(async (chatId: string) => {
    try {
      const chat = await chatStorage.getChat(chatId);
      if (chat) {
        setCurrentChat(chatId, chat.messages);
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
      options?.onError?.(err instanceof Error ? err : new Error('Failed to load chat'));
    }
  }, [setCurrentChat, options]);

  // Send a message
  const sendMessage = useCallback(async (
    content: string,
    systemPrompt?: string
  ) => {
    if (!content.trim() || isStreaming) return;

    let chatId = currentChatId;

    // Create a new chat if needed
    if (!chatId) {
      const newChat = await chatStorage.createChat(activeAgentId);
      chatId = newChat.id;
      setCurrentChat(chatId, []);
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    await chatStorage.addMessageToChat(chatId, {
      role: 'user',
      content: content.trim(),
    });

    // Prepare messages for API
    const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // Add system prompt if provided
    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    // Add conversation history
    for (const msg of messages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }
    apiMessages.push({ role: 'user', content: content.trim() });

    // Start streaming
    setStreaming(true);
    setStreamingContent('');

    try {
      const model = currentModel || DEFAULT_MODEL;
      const fullResponse = await streamResponse(model, apiMessages);

      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
      await chatStorage.addMessageToChat(chatId, {
        role: 'assistant',
        content: fullResponse,
      });

      // Generate title for new chats (first exchange)
      if (messages.length === 0) {
        generateChatTitle(content.trim(), fullResponse)
          .then(async (title) => {
            await chatStorage.updateChat(chatId, { title });
          })
          .catch((err) => {
            console.error('Failed to generate chat title:', err);
          });
      }

      setStreamingContent('');
    } catch (err) {
      console.error('Failed to send message:', err);

      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
        timestamp: new Date(),
      };

      addMessage(errorMessage);
    } finally {
      setStreaming(false);
    }
  }, [
    currentChatId,
    messages,
    isStreaming,
    activeAgentId,
    currentModel,
    setCurrentChat,
    addMessage,
    setStreaming,
    setStreamingContent,
    streamResponse,
  ]);

  // Start a new chat
  const newChat = useCallback(async (agentId?: string) => {
    clearMessages();
    const chat = await chatStorage.createChat(agentId || activeAgentId);
    setCurrentChat(chat.id, []);
    return chat;
  }, [activeAgentId, clearMessages, setCurrentChat]);

  return {
    chatId: currentChatId,
    messages,
    isStreaming,
    streamingContent,
    loadChat,
    sendMessage,
    newChat,
    stopStreaming,
    clearMessages,
    isModelLoaded,
  };
}
