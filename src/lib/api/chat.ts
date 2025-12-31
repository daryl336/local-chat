import { streamRequest, apiRequest } from './client';
import { ChatCompletionRequest, ChatCompletionResponse, ChatCompletionChunk } from '@/types/chat';

export interface StreamChatOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
  chatId?: string; // For RAG context injection
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

  console.log('[Stream] Starting request to:', model);
  console.log('[Stream] Messages:', messages.length);

  // Add chat_id query param for RAG context injection
  const endpoint = options?.chatId
    ? `/v1/chat/completions?chat_id=${encodeURIComponent(options.chatId)}`
    : '/v1/chat/completions';

  const response = await streamRequest(endpoint, request);
  console.log('[Stream] Got response, status:', response.status);

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let chunkCount = 0;

  try {
    let readCount = 0;
    while (true) {
      const { done, value } = await reader.read();
      readCount++;
      console.log(`[Stream] Read #${readCount}, done=${done}, bytes=${value?.length || 0}`);

      if (done) {
        console.log('[Stream] Stream done, total chunks:', chunkCount);
        break;
      }

      const decoded = decoder.decode(value, { stream: true });
      console.log('[Stream] Decoded text:', decoded.slice(0, 200));
      buffer += decoded;
      const lines = buffer.split('\n');
      console.log('[Stream] Lines count:', lines.length);

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
          continue;
        }

        const data = trimmedLine.slice(6); // Remove 'data: ' prefix
        console.log('[Stream] SSE data:', data.slice(0, 100));

        if (data === '[DONE]') {
          console.log('[Stream] Received [DONE] signal');
          return;
        }

        try {
          const chunk: ChatCompletionChunk = JSON.parse(data);
          console.log('[Stream] Parsed chunk:', JSON.stringify(chunk.choices?.[0]));
          const content = chunk.choices?.[0]?.delta?.content;

          if (content) {
            chunkCount++;
            console.log('[Stream] YIELDING content:', content);
            yield content;
          } else {
            console.log('[Stream] No content in delta');
          }
        } catch (e) {
          // Skip invalid JSON lines
          console.warn('Failed to parse SSE chunk:', data, e);
        }
      }
    }
  } finally {
    reader.releaseLock();
    console.log('[Stream] Reader released');
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
      content: `You are a title generator. Generate a short title (3-6 words) that summarizes ONLY the topic being discussed.

Rules:
- Output ONLY the title, nothing else
- No quotes, no prefixes like "Title:", no explanations
- Do not include words like "User", "Assistant", "Question", "Chat"
- Focus on the actual subject matter`,
    },
    {
      role: 'user',
      content: `Generate a title for this conversation:\n\n${conversationContext}`,
    },
  ];

  try {
    const response = await chatCompletion(TITLE_MODEL, messages, {
      maxTokens: 20,
      temperature: 0.7,
    });

    const title = response.choices?.[0]?.message?.content?.trim();

    // Clean up the title - remove quotes, prefixes, limit length
    if (title) {
      return title
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/^(Title:|Topic:|Subject:)\s*/i, '') // Remove common prefixes
        .replace(/^(User|Assistant|Question|Chat)[\s:]+/i, '') // Remove role prefixes
        .replace(/[.!?]$/, '') // Remove trailing punctuation
        .trim()
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
