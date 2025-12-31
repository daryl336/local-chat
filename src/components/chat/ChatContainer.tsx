'use client';

import { WelcomeScreen } from './WelcomeScreen';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Message } from '@/types/chat';
import { AgentConfiguration } from '@/types/agent';

interface ChatContainerProps {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
  activeAgent?: AgentConfiguration | null;
  onSendMessage: (message: string) => void;
  onStopStreaming?: () => void;
  onQuickAction?: (action: string) => void;
  isModelLoaded?: boolean;
  chatId?: string | null;
  onCreateChat?: () => Promise<string>;
}

export function ChatContainer({
  messages,
  streamingContent,
  isStreaming,
  activeAgent,
  onSendMessage,
  onStopStreaming,
  onQuickAction,
  isModelLoaded,
  chatId,
  onCreateChat,
}: ChatContainerProps) {
  const hasMessages = messages.length > 0;

  const handleQuickAction = (action: string) => {
    if (action.startsWith('prompt:')) {
      const prompt = action.replace('prompt:', '');
      onSendMessage(prompt);
    } else {
      onQuickAction?.(action);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {hasMessages ? (
        <>
          <MessageList
            messages={messages}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
          />
          <MessageInput
            onSend={onSendMessage}
            onStop={onStopStreaming}
            isStreaming={isStreaming}
            activeAgent={activeAgent}
            disabled={!isModelLoaded}
            chatId={chatId}
            onCreateChat={onCreateChat}
            placeholder={
              isModelLoaded
                ? 'Type your message...'
                : 'Waiting for model to load...'
            }
          />
        </>
      ) : (
        <>
          <WelcomeScreen onQuickAction={handleQuickAction} />
          <MessageInput
            onSend={onSendMessage}
            onStop={onStopStreaming}
            isStreaming={isStreaming}
            activeAgent={activeAgent}
            disabled={!isModelLoaded}
            chatId={chatId}
            onCreateChat={onCreateChat}
            placeholder={
              isModelLoaded
                ? 'Type your message...'
                : 'Waiting for model to load...'
            }
          />
        </>
      )}
    </div>
  );
}
