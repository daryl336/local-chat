'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatSession } from '@/types/chat';
import * as chatStorage from '@/lib/storage/chats';

export function useChats() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const allChats = await chatStorage.getAllChats();
      setChats(allChats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chats'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createChat = useCallback(async (agentId: string | null = null) => {
    try {
      const newChat = await chatStorage.createChat(agentId);
      setChats((prev) => [newChat, ...prev]);
      return newChat;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create chat'));
      throw err;
    }
  }, []);

  const deleteChat = useCallback(async (id: string) => {
    try {
      await chatStorage.deleteChat(id);
      setChats((prev) => prev.filter((chat) => chat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete chat'));
      throw err;
    }
  }, []);

  const updateChat = useCallback(async (id: string, updates: Partial<ChatSession>) => {
    try {
      await chatStorage.updateChat(id, updates);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === id ? { ...chat, ...updates, updatedAt: new Date() } : chat
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update chat'));
      throw err;
    }
  }, []);

  const searchChats = useCallback(async (query: string) => {
    try {
      if (!query.trim()) {
        return await chatStorage.getAllChats();
      }
      return await chatStorage.searchChats(query);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search chats'));
      throw err;
    }
  }, []);

  const refreshChats = useCallback(() => {
    loadChats();
  }, [loadChats]);

  const clearAllChats = useCallback(async () => {
    try {
      await chatStorage.clearAllChats();
      setChats([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear chats'));
      throw err;
    }
  }, []);

  return {
    chats,
    isLoading,
    error,
    createChat,
    deleteChat,
    updateChat,
    searchChats,
    refreshChats,
    clearAllChats,
  };
}