'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sidebar, Header } from '@/components/layout';
import { ChatContainer } from '@/components/chat';
import { AgentModal } from '@/components/agents';
import { useChat, useChats, useAgents, useModels } from '@/hooks';
import { useChatStore } from '@/stores/chatStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import * as chatStorage from '@/lib/storage/chats';

export default function Home() {
  const [chatTitle, setChatTitle] = useState<string | undefined>();

  const {
    chatId,
    messages,
    isStreaming,
    streamingContent,
    loadChat,
    sendMessage,
    newChat,
    stopStreaming,
  } = useChat();

  const { activeAgentId, setActiveAgent } = useChatStore();
  const { chats, refreshChats } = useChats();
  const { agents, getAgentById } = useAgents();
  const { isModelLoaded, checkStatus } = useModels();

  const activeAgent = activeAgentId ? getAgentById(activeAgentId) : null;

  // Check model status on mount and periodically
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Update chat title when messages change
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const chat = chats.find((c) => c.id === chatId);
      setChatTitle(chat?.title || 'New Chat');
    } else {
      setChatTitle(undefined);
    }
  }, [chatId, messages, chats]);

  // Handle new chat
  const handleNewChat = useCallback(async () => {
    await newChat();
    refreshChats();
  }, [newChat, refreshChats]);

  // Handle chat selection
  const handleSelectChat = useCallback(async (selectedChatId: string) => {
    await loadChat(selectedChatId);

    // Also load the agent associated with this chat
    const chat = await chatStorage.getChat(selectedChatId);
    if (chat?.agentId) {
      setActiveAgent(chat.agentId);
    } else {
      setActiveAgent(null);
    }

    refreshChats();
  }, [loadChat, setActiveAgent, refreshChats]);

  // Handle agent selection
  const handleSelectAgent = useCallback((agentId: string | null) => {
    setActiveAgent(agentId);
  }, [setActiveAgent]);

  // Handle send message with agent system prompt
  const handleSendMessage = useCallback((content: string) => {
    const systemPrompt = activeAgent?.systemPrompt;
    sendMessage(content, systemPrompt);
    // Delay refresh to allow the message to be saved
    setTimeout(refreshChats, 100);
  }, [sendMessage, activeAgent, refreshChats]);

  // Handle quick actions from welcome screen
  const handleQuickAction = useCallback((action: string) => {
    if (action === 'agent') {
      // Open agent modal or focus sidebar agents section
      useSidebarStore.getState().setSidebarExpanded(true);
    }
  }, []);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onSelectAgent={handleSelectAgent}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={chatTitle} />

        <ChatContainer
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          activeAgent={activeAgent}
          onSendMessage={handleSendMessage}
          onStopStreaming={stopStreaming}
          onQuickAction={handleQuickAction}
          isModelLoaded={isModelLoaded}
        />
      </div>

      {/* Agent Modal */}
      <AgentModal />
    </div>
  );
}
