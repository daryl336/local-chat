'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Bot } from 'lucide-react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils/cn';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

// Escape markdown patterns that shouldn't be interpreted as formatting
// e.g., "5." at start of line shouldn't become an ordered list
function escapeUnintendedMarkdown(content: string): string {
  // Only escape if the entire content is just a number followed by a period (like "5." or "42.")
  // This prevents short numeric answers from being rendered as lists
  if (/^\d+\.\s*$/.test(content.trim())) {
    return content.replace(/^(\d+)\./, '$1\\.');
  }
  return content;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-primary-600'
            : 'bg-surface-tertiary border border-border'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-content-secondary" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'max-w-[80%] group',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          className={cn(
            'inline-block rounded-2xl px-4 py-2.5',
            isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-surface-secondary border border-border rounded-bl-md'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content prose prose-invert prose-sm max-w-none">
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ol: ({ children, start }) => (
                      <ol start={start} className="list-decimal list-inside mb-2">
                        {children}
                      </ol>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-2">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1">{children}</li>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-surface-tertiary rounded-lg p-3 overflow-x-auto my-2">
                        {children}
                      </pre>
                    ),
                    code: ({ className, children, ...props }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-surface-tertiary px-1.5 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {escapeUnintendedMarkdown(message.content)}
                </ReactMarkdown>
              ) : null}
              {isStreaming && (
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-2 h-4 bg-primary-400 animate-pulse" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isStreaming && (
          <div className={cn(
            'mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser && 'text-right'
          )}>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-content-muted hover:text-content-secondary"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
