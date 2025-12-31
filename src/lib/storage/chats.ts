import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { ChatSession, Message } from '@/types/chat';

export async function createChat(agentId: string | null = null): Promise<ChatSession> {
  const now = new Date();
  const chat: ChatSession = {
    id: uuidv4(),
    title: 'New Chat',
    agentId,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  await db.chats.add(chat);
  return chat;
}

export async function getChat(id: string): Promise<ChatSession | undefined> {
  return db.chats.get(id);
}

export async function getAllChats(): Promise<ChatSession[]> {
  return db.chats.orderBy('updatedAt').reverse().toArray();
}

export async function updateChat(id: string, updates: Partial<ChatSession>): Promise<void> {
  await db.chats.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteChat(id: string): Promise<void> {
  await db.chats.delete(id);
}

export async function addMessageToChat(chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const chat = await getChat(chatId);
  if (!chat) throw new Error('Chat not found');

  const newMessage: Message = {
    ...message,
    id: uuidv4(),
    timestamp: new Date(),
  };

  const updatedMessages = [...chat.messages, newMessage];

  // Generate title from first user message if this is the first message
  let title = chat.title;
  if (chat.messages.length === 0 && message.role === 'user') {
    title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
  }

  await updateChat(chatId, {
    messages: updatedMessages,
    title,
  });

  return newMessage;
}

export async function updateLastMessage(chatId: string, content: string): Promise<void> {
  const chat = await getChat(chatId);
  if (!chat || chat.messages.length === 0) return;

  const messages = [...chat.messages];
  messages[messages.length - 1] = {
    ...messages[messages.length - 1],
    content,
  };

  await updateChat(chatId, { messages });
}

export async function searchChats(query: string): Promise<ChatSession[]> {
  const allChats = await getAllChats();
  const lowerQuery = query.toLowerCase();

  return allChats.filter(chat =>
    chat.title.toLowerCase().includes(lowerQuery) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))
  );
}

export async function clearAllChats(): Promise<void> {
  await db.chats.clear();
}
