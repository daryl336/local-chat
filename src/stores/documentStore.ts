/**
 * Zustand store for document management.
 */

import { create } from 'zustand';
import type { DocumentAttachment } from '@/types/document';
import * as documentsApi from '@/lib/api/documents';

interface DocumentState {
  // Documents for the current chat
  documents: DocumentAttachment[];

  // Current chat ID (set when documents are loaded or uploaded)
  currentChatId: string | null;

  // Files pending upload
  pendingFiles: File[];

  // Loading state
  isLoading: boolean;

  // Upload progress tracking
  uploadingIds: Set<string>;

  // Actions
  setDocuments: (documents: DocumentAttachment[]) => void;
  addDocument: (document: DocumentAttachment) => void;
  updateDocument: (id: string, updates: Partial<DocumentAttachment>) => void;
  removeDocument: (id: string) => void;
  clearDocuments: () => void;

  // Pending files
  addPendingFiles: (files: File[]) => void;
  removePendingFile: (index: number) => void;
  clearPendingFiles: () => void;

  // API operations
  loadDocuments: (chatId: string) => Promise<void>;
  uploadDocument: (chatId: string, file: File) => Promise<DocumentAttachment>;
  deleteDocument: (chatId: string, documentId: string) => Promise<void>;
  uploadAllPending: (chatId: string) => Promise<void>;
  refreshDocument: (chatId: string, documentId: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentChatId: null,
  pendingFiles: [],
  isLoading: false,
  uploadingIds: new Set(),

  setDocuments: (documents) => set({ documents }),

  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),

  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    })),

  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),

  clearDocuments: () => set({ documents: [], pendingFiles: [] }),

  addPendingFiles: (files) =>
    set((state) => ({
      pendingFiles: [...state.pendingFiles, ...files],
    })),

  removePendingFile: (index) =>
    set((state) => ({
      pendingFiles: state.pendingFiles.filter((_, i) => i !== index),
    })),

  clearPendingFiles: () => set({ pendingFiles: [] }),

  loadDocuments: async (chatId) => {
    set({ isLoading: true, currentChatId: chatId });
    try {
      const response = await documentsApi.getDocuments(chatId);
      set({ documents: response.documents });
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadDocument: async (chatId, file) => {
    const tempId = `temp-${Date.now()}`;
    set((state) => ({
      uploadingIds: new Set(state.uploadingIds).add(tempId),
      currentChatId: chatId, // Track which chat we're uploading to
    }));

    try {
      const response = await documentsApi.uploadDocument(chatId, file);
      set((state) => ({
        documents: [...state.documents, response.document],
      }));
      return response.document;
    } finally {
      set((state) => {
        const newIds = new Set(state.uploadingIds);
        newIds.delete(tempId);
        return { uploadingIds: newIds };
      });
    }
  },

  deleteDocument: async (chatId, documentId) => {
    try {
      await documentsApi.deleteDocument(chatId, documentId);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== documentId),
      }));
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  },

  uploadAllPending: async (chatId) => {
    const { pendingFiles, uploadDocument } = get();
    const filesToUpload = [...pendingFiles];

    // Clear pending files immediately
    set({ pendingFiles: [] });

    // Upload all files
    const results = await Promise.allSettled(
      filesToUpload.map((file) => uploadDocument(chatId, file))
    );

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to upload ${filesToUpload[index].name}:`, result.reason);
      }
    });
  },

  refreshDocument: async (chatId, documentId) => {
    try {
      const document = await documentsApi.getDocument(chatId, documentId);
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? document : doc
        ),
      }));
    } catch (error) {
      console.error('Failed to refresh document:', error);
    }
  },
}));