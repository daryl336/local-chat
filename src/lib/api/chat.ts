import { streamRequest, apiRequest } from './client';
import { ChatCompletionRequest, ChatCompletionResponse, ChatCompletionChunk } from '@/types/chat';

export interface StreamChatOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
}

export async function* streamChatCompletion(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: StreamChatOptions
): AsyncGenerator<string, void, unknown> {
  const request: ChatCompletionRequest = {
    model,
    messages,
    stream: true,
    temperature: options?.temperature,
    max_tokens: options?.maxTokens,
    top_p: options?.topP,
    stop: options?.stop,
  };

  const response = await streamRequest('/v1/chat/completions', request);

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
          continue;
        }

        const data = trimmedLine.slice(6); // Remove 'data: ' prefix

        if (data === '[DONE]') {
          return;
        }

        try {
          const chunk: ChatCompletionChunk = JSON.parse(data);
          const content = chunk.choices?.[0]?.delta?.content;

          if (content) {
            yield content;
          }
        } catch {
          // Skip invalid JSON lines
          console.warn('Failed to parse SSE chunk:', data);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function chatCompletion(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: StreamChatOptions
): Promise<ChatCompletionResponse> {
  const request: ChatCompletionRequest = {
    model,
    messages,
    stream: false,
    temperature: options?.temperature,
    max_tokens: options?.maxTokens,
    top_p: options?.topP,
    stop: options?.stop,
  };

  return apiRequest<ChatCompletionResponse>('/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Small model for generating chat titles
const TITLE_MODEL = 'mlx-community/Mistral-7B-Instruct-v0.3-4bit';

/**
 * Generate a concise title for a chat based on the conversation
 */
export async function generateChatTitle(
  userMessage: string,
  assistantMessage?: string
): Promise<string> {
  const conversationContext = assistantMessage
    ? `User: ${userMessage}\nAssistant: ${assistantMessage}`
    : `User: ${userMessage}`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: 'Generate a very short, concise title (3-6 words max) for this conversation. Reply with ONLY the title, no quotes, no explanation, no punctuation at the end.',
    },
    {
      role: 'user',
      content: conversationContext,
    },
  ];

  try {
    const response = await chatCompletion(TITLE_MODEL, messages, {
      maxTokens: 20,
      temperature: 0.7,
    });

    const title = response.choices?.[0]?.message?.content?.trim();

    // Clean up the title - remove quotes, limit length
    if (title) {
      return title
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/[.!?]$/, '') // Remove trailing punctuation
        .slice(0, 50); // Limit length
    }

    // Fallback to truncated user message
    return userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
  } catch (error) {
    console.error('Failed to generate title:', error);
    // Fallback to truncated user message
    return userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
  }
}
