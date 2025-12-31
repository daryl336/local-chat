'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AgentConfiguration, CATEGORY_COLORS } from '@/types/agent';
import { DocumentChipList, UploadDropdown, useFileUpload } from './DocumentUpload';

interface MessageInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  activeAgent?: AgentConfiguration | null;
  placeholder?: string;
  chatId?: string | null;
  onCreateChat?: () => Promise<string>;
}

export function MessageInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
  activeAgent,
  placeholder = 'Type your message...',
  chatId,
  onCreateChat,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { openFilePicker, FileInput } = useFileUpload({ chatId: chatId ?? null, onCreateChat });

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!message.trim() || disabled || isStreaming) return;
    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const agentColors = activeAgent ? CATEGORY_COLORS[activeAgent.category] : null;

  return (
    <div className="p-2 pb-4 sm:p-4 sm:pb-6">
      <div className="max-w-4xl mx-auto">
        {/* Input container with glass effect */}
        <div className={cn(
          'relative rounded-2xl transition-all duration-300',
          'glass-strong',
          isFocused && 'border-primary-500/40',
          !disabled && 'glow-hover'
        )}>
          {/* Active agent indicator */}
          {activeAgent && (
            <div className="flex items-center gap-2 px-4 pt-3 pb-0">
              <div className={cn('w-5 h-5 rounded-lg flex items-center justify-center', agentColors?.bg)}>
                <Bot className={cn('w-3 h-3', agentColors?.text)} />
              </div>
              <span className="text-xs text-content-secondary">
                Using <span className={cn('font-medium', agentColors?.text)}>{activeAgent.name}</span>
              </span>
            </div>
          )}

          {/* Document chips area */}
          <DocumentChipList chatId={chatId ?? null} disabled={disabled} />

          {/* Input area */}
          <div className="flex items-end gap-2 p-2 sm:gap-3 sm:p-3">
            {/* Plus button with dropdown */}
            <UploadDropdown onUploadFiles={openFilePicker} disabled={disabled} />

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className={cn(
                  'focus-none w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl resize-none',
                  'bg-transparent',
                  'text-content text-sm sm:text-[15px] placeholder:text-content-muted',
                  'focus:outline-none',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-150'
                )}
              />
            </div>

            {/* Send/Stop button */}
            {isStreaming ? (
              <button
                onClick={onStop}
                className={cn(
                  'focus-none h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  'bg-accent-red/20 border border-accent-red/30 text-accent-red',
                  'hover:bg-accent-red/30 hover:scale-105',
                  'transition-all duration-200'
                )}
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className={cn(
                  'focus-none h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  'transition-all duration-200',
                  message.trim() && !disabled
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105'
                    : 'bg-surface-tertiary/50 text-content-muted cursor-not-allowed'
                )}
              >
                {message.trim() && !disabled ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        {FileInput}

        {/* Hint - hidden on mobile */}
        <p className="hidden sm:block text-[11px] text-content-muted/60 text-center mt-3">
          <span className="px-1.5 py-0.5 rounded bg-surface-tertiary/30 text-content-muted/80 font-medium">Enter</span>
          {' '}to send{' '}
          <span className="mx-1 text-content-muted/40">|</span>
          {' '}<span className="px-1.5 py-0.5 rounded bg-surface-tertiary/30 text-content-muted/80 font-medium">Shift + Enter</span>
          {' '}for new line
        </p>
      </div>
    </div>
  );
}
