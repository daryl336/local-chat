import { create } from 'zustand';

interface SidebarState {
  // Sidebar visibility
  isExpanded: boolean;

  // Mobile sidebar state
  isMobileOpen: boolean;

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
  setMobileOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setSearchQuery: (query: string) => void;
  openAgentModal: (agentId?: string) => void;
  closeAgentModal: () => void;
  setDeletingChat: (chatId: string | null) => void;
  setDeletingAgent: (agentId: string | null) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: true,
  isMobileOpen: false,
  searchQuery: '',
  isAgentModalOpen: false,
  editingAgentId: null,
  deletingChatId: null,
  deletingAgentId: null,

  toggleSidebar: () =>
    set((state) => ({ isExpanded: !state.isExpanded })),

  setSidebarExpanded: (expanded) =>
    set({ isExpanded: expanded }),

  setMobileOpen: (open) =>
    set({ isMobileOpen: open }),

  toggleMobileSidebar: () =>
    set((state) => ({ isMobileOpen: !state.isMobileOpen })),

  closeMobileSidebar: () =>
    set({ isMobileOpen: false }),

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
