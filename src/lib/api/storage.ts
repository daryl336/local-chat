import { apiRequest } from './client';

// Types matching backend schemas
export interface ChatAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  filename: string;
  path: string;
  mime_type?: string;
  size_bytes?: number;
  width?: number;
  height?: number;
}

export interface StoredMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments: ChatAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  agent_id: string | null;
  messages: StoredMessage[];
  created_at: string;
  updated_at: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  icon: string | null;
  color: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Chat API
// ============================================================================

export const storageApi = {
  // Chat operations
  createChat: (agentId?: string, title?: string) =>
    apiRequest<ChatSession>('/storage/chats', {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId, title }),
    }),

  getAllChats: () => apiRequest<ChatSession[]>('/storage/chats'),

  getChat: (chatId: string) => apiRequest<ChatSession>(`/storage/chats/${chatId}`),

  updateChat: (chatId: string, updates: { title?: string; agent_id?: string }) =>
    apiRequest<ChatSession>(`/storage/chats/${chatId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteChat: (chatId: string) =>
    apiRequest<{ message: string }>(`/storage/chats/${chatId}`, {
      method: 'DELETE',
    }),

  clearAllChats: () =>
    apiRequest<{ message: string }>('/storage/chats', {
      method: 'DELETE',
    }),

  addMessage: (
    chatId: string,
    message: {
      role: 'system' | 'user' | 'assistant';
      content: string;
      attachments?: ChatAttachment[];
    }
  ) =>
    apiRequest<StoredMessage>(`/storage/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    }),

  searchChats: (query: string) =>
    apiRequest<ChatSession[]>(`/storage/chats/search/${encodeURIComponent(query)}`),

  // Agent operations
  createAgent: (agent: {
    name: string;
    system_prompt: string;
    description?: string;
    icon?: string;
    color?: string;
    category?: string;
  }) =>
    apiRequest<AgentConfig>('/storage/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    }),

  getAllAgents: () => apiRequest<AgentConfig[]>('/storage/agents'),

  getAgent: (agentId: string) => apiRequest<AgentConfig>(`/storage/agents/${agentId}`),

  updateAgent: (
    agentId: string,
    updates: {
      name?: string;
      description?: string;
      system_prompt?: string;
      icon?: string;
      color?: string;
      category?: string;
    }
  ) =>
    apiRequest<AgentConfig>(`/storage/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteAgent: (agentId: string) =>
    apiRequest<{ message: string }>(`/storage/agents/${agentId}`, {
      method: 'DELETE',
    }),

  clearAllAgents: () =>
    apiRequest<{ message: string }>('/storage/agents', {
      method: 'DELETE',
    }),
};