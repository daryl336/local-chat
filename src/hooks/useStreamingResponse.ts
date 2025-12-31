'use client';

import { useState, useCallback, useRef } from 'react';
import { streamChatCompletion, StreamChatOptions } from '@/lib/api/chat';

interface UseStreamingResponseOptions {
  onChunk?: (chunk: string, fullContent: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export function useStreamingResponse(options?: UseStreamingResponseOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef(false);

  const streamResponse = useCallback(async (
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    chatOptions?: StreamChatOptions
  ) => {
    setIsStreaming(true);
    setStreamedContent('');
    setError(null);
    abortRef.current = false;

    let fullContent = '';

    try {
      for await (const chunk of streamChatCompletion(model, messages, chatOptions)) {
        if (abortRef.current) {
          break;
        }

        fullContent += chunk;
        setStreamedContent(fullContent);
        options?.onChunk?.(chunk, fullContent);
      }

      if (!abortRef.current) {
        options?.onComplete?.(fullContent);
      }

      return fullContent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Streaming failed');
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsStreaming(false);
    }
  }, [options]);

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
  }, []);

  const reset = useCallback(() => {
    setStreamedContent('');
    setError(null);
    abortRef.current = false;
  }, []);

  return {
    streamResponse,
    stopStreaming,
    reset,
    isStreaming,
    streamedContent,
    error,
  };
}
