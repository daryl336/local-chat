/**
 * Chat storage - now uses backend API instead of IndexedDB
 */

import { storageApi, ChatSession, StoredMessage, ChatAttachment } from '@/lib/api/storage';
import { ChatSession as FrontendChatSession, Message } from '@/types/chat';

// Convert backend format to frontend format
function toFrontendChat(chat: ChatSession): FrontendChatSession {
  return {
    id: chat.id,
    title: chat.title,
    agentId: chat.agent_id,
    messages: chat.messages.map(toFrontendMessage),
    createdAt: new Date(chat.created_at),
    updatedAt: new Date(chat.updated_at),
  };
}

function toFrontendMessage(msg: StoredMessage): Message {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    attachments: msg.attachments.length > 0 ? msg.attachments : undefined,
  };
}

export async function createChat(agentId: string | null = null): Promise<FrontendChatSession> {
  const chat = await storageApi.createChat(agentId || undefined);
  return toFrontendChat(chat);
}

export async function getChat(id: string): Promise<FrontendChatSession | undefined> {
  try {
    const chat = await storageApi.getChat(id);
    return toFrontendChat(chat);
  } catch {
    return undefined;
  }
}

export async function getAllChats(): Promise<FrontendChatSession[]> {
  const chats = await storageApi.getAllChats();
  return chats.map(toFrontendChat);
}

export async function updateChat(
  id: string,
  updates: Partial<FrontendChatSession>
): Promise<void> {
  await storageApi.updateChat(id, {
    title: updates.title,
    agent_id: updates.agentId ?? undefined,
  });
}

export async function deleteChat(id: string): Promise<void> {
  await storageApi.deleteChat(id);
}

export async function addMessageToChat(
  chatId: string,
  message: Omit<Message, 'id' | 'timestamp'>
): Promise<Message> {
  const storedMessage = await storageApi.addMessage(chatId, {
    role: message.role,
    content: message.content,
    attachments: message.attachments as ChatAttachment[],
  });
  return toFrontendMessage(storedMessage);
}

export async function updateLastMessage(_chatId: string, _content: string): Promise<void> {
  // Note: Backend doesn't support updating messages directly
  // This is a no-op for now - messages are immutable on the backend
  console.warn('updateLastMessage is not supported with backend storage');
}

export async function searchChats(query: string): Promise<FrontendChatSession[]> {
  if (!query.trim()) {
    return getAllChats();
  }
  const chats = await storageApi.searchChats(query);
  return chats.map(toFrontendChat);
}

export async function clearAllChats(): Promise<void> {
  await storageApi.clearAllChats();
}