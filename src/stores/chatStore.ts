import { create } from 'zustand';
import { Message } from '@/types/chat';

interface ChatState {
  // Current active chat
  currentChatId: string | null;
  messages: Message[];

  // Streaming state
  isStreaming: boolean;
  streamingContent: string;

  // Active agent
  activeAgentId: string | null;

  // Model state
  currentModel: string | null;
  isModelLoaded: boolean;
  isModelLoading: boolean;

  // Actions
  setCurrentChat: (chatId: string | null, messages?: Message[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  setActiveAgent: (agentId: string | null) => void;
  setModel: (model: string | null, loaded: boolean) => void;
  setModelLoading: (loading: boolean) => void;
  clearMessages: () => void;
  reset: () => void;
}

const initialState = {
  currentChatId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  activeAgentId: null,
  currentModel: null,
  isModelLoaded: false,
  isModelLoading: false,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  setCurrentChat: (chatId, messages = []) =>
    set({
      currentChatId: chatId,
      messages,
      streamingContent: '',
      isStreaming: false,
    }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const messages = [...state.messages];
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content,
      };
      return { messages };
    }),

  setStreaming: (isStreaming) =>
    set({ isStreaming }),

  setStreamingContent: (content) =>
    set({ streamingContent: content }),

  appendStreamingContent: (chunk) =>
    set((state) => ({
      streamingContent: state.streamingContent + chunk,
    })),

  setActiveAgent: (agentId) =>
    set({ activeAgentId: agentId }),

  setModel: (model, loaded) =>
    set({
      currentModel: model,
      isModelLoaded: loaded,
      isModelLoading: false,
    }),

  setModelLoading: (loading) =>
    set({ isModelLoading: loading }),

  clearMessages: () =>
    set({
      messages: [],
      streamingContent: '',
      isStreaming: false,
    }),

  reset: () => set(initialState),
}));
