'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
}

export function MessageList({ messages, streamingContent, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

        {/* Streaming message */}
        {isStreaming && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent || '',
              timestamp: new Date(),
            }}
            isStreaming
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
