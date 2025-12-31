'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Bot, ChevronDown, Sparkles } from 'lucide-react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils/cn';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

// Parse content to extract thinking blocks and regular content
interface ParsedContent {
  thinking: string | null;
  content: string;
}

function parseThinkingBlocks(content: string): ParsedContent {
  // Match <think>...</think> blocks (case insensitive, handles newlines)
  const thinkRegex = /<think>([\s\S]*?)<\/think>/gi;
  const matches = content.match(thinkRegex);

  if (!matches || matches.length === 0) {
    return { thinking: null, content };
  }

  // Extract all thinking content
  let thinkingContent = '';
  matches.forEach((match) => {
    const innerContent = match.replace(/<\/?think>/gi, '').trim();
    if (innerContent) {
      thinkingContent += (thinkingContent ? '\n\n' : '') + innerContent;
    }
  });

  // Remove thinking blocks from main content
  const cleanedContent = content.replace(thinkRegex, '').trim();

  return {
    thinking: thinkingContent || null,
    content: cleanedContent,
  };
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

// Collapsible thinking block component
function ThinkingBlock({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg',
          'bg-surface-tertiary/50 hover:bg-surface-tertiary',
          'border border-border/50 hover:border-border',
          'transition-all duration-200',
          'text-sm text-content-secondary'
        )}
      >
        <Sparkles className={cn(
          'w-4 h-4 text-primary-400 flex-shrink-0',
          isStreaming && 'animate-pulse'
        )} />
        <span className="flex-1 font-medium">
          {isStreaming ? 'Thinking...' : 'Show thinking'}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-content-muted transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <div className={cn(
          'mt-2 px-3 py-2 rounded-lg',
          'bg-surface-tertiary/30 border border-border/30',
          'text-sm text-content-secondary italic',
          'animate-fade-in'
        )}>
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      )}
    </div>
  );
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  // Parse thinking blocks from assistant messages
  const parsedContent = useMemo(() => {
    if (isUser || !message.content) {
      return { thinking: null, content: message.content };
    }
    return parseThinkingBlocks(message.content);
  }, [message.content, isUser]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-primary-600'
            : 'bg-surface-tertiary border border-border'
        )}
      >
        {isUser ? (
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        ) : (
          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-content-secondary" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'max-w-[90%] sm:max-w-[85%] md:max-w-[80%] group',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          className={cn(
            'inline-block rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5',
            isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-surface-secondary border border-border rounded-bl-md'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content prose prose-invert prose-sm max-w-none">
              {/* Collapsible thinking block */}
              {parsedContent.thinking && (
                <ThinkingBlock content={parsedContent.thinking} isStreaming={isStreaming} />
              )}
              {parsedContent.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ol: ({ children, start }) => (
                      <ol start={start} className="list-decimal list-outside ml-4 mb-2 space-y-0">
                        {children}
                      </ol>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside ml-4 mb-2 space-y-0">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="pl-1">{children}</li>
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
                  {escapeUnintendedMarkdown(parsedContent.content)}
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
