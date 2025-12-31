/**
 * API client for document upload and RAG operations.
 */

import { API_BASE_URL } from '../constants';
import type {
  DocumentAttachment,
  DocumentListResponse,
  DocumentUploadResponse,
  RAGSearchResponse,
} from '@/types/document';

/**
 * Upload a document to a chat for RAG processing.
 */
export async function uploadDocument(
  chatId: string,
  file: File
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/storage/chats/${chatId}/documents`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to upload document: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all documents for a chat.
 */
export async function getDocuments(chatId: string): Promise<DocumentListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/storage/chats/${chatId}/documents`
  );

  // Return empty list if chat not found (404)
  if (response.status === 404) {
    return { documents: [], total: 0 };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to get documents: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a specific document.
 */
export async function getDocument(
  chatId: string,
  documentId: string
): Promise<DocumentAttachment> {
  const response = await fetch(
    `${API_BASE_URL}/storage/chats/${chatId}/documents/${documentId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to get document: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a document from a chat.
 */
export async function deleteDocument(
  chatId: string,
  documentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/storage/chats/${chatId}/documents/${documentId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to delete document: ${response.statusText}`);
  }
}

/**
 * Search documents in a chat using RAG.
 */
export async function searchDocuments(
  chatId: string,
  query: string,
  topK: number = 5
): Promise<RAGSearchResponse> {
  const response = await fetch(
    `${API_BASE_URL}/storage/chats/${chatId}/documents/search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        top_k: topK,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to search documents: ${response.statusText}`);
  }

  return response.json();
}
