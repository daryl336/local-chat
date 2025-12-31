import { create } from 'zustand';

interface SidebarState {
  // Sidebar visibility
  isExpanded: boolean;

  // Search
  searchQuery: string;

  // Modal states
  isAgentModalOpen: boolean;
  editingAgentId: string | null;

  // Delete confirmation
  deletingChatId: string | null;
  deletingAgentId: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setSearchQuery: (query: string) => void;
  openAgentModal: (agentId?: string) => void;
  closeAgentModal: () => void;
  setDeletingChat: (chatId: string | null) => void;
  setDeletingAgent: (agentId: string | null) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: true,
  searchQuery: '',
  isAgentModalOpen: false,
  editingAgentId: null,
  deletingChatId: null,
  deletingAgentId: null,

  toggleSidebar: () =>
    set((state) => ({ isExpanded: !state.isExpanded })),

  setSidebarExpanded: (expanded) =>
    set({ isExpanded: expanded }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  openAgentModal: (agentId) =>
    set({
      isAgentModalOpen: true,
      editingAgentId: agentId || null,
    }),

  closeAgentModal: () =>
    set({
      isAgentModalOpen: false,
      editingAgentId: null,
    }),

  setDeletingChat: (chatId) =>
    set({ deletingChatId: chatId }),

  setDeletingAgent: (agentId) =>
    set({ deletingAgentId: agentId }),
}));
