/**
 * Document types for RAG document upload and management.
 */

export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface DocumentAttachment {
  id: string;
  filename: string;
  original_path: string;
  mime_type: string;
  size_bytes: number;
  chunk_count: number;
  index_path?: string;
  metadata_path?: string;
  status: DocumentStatus;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface DocumentUploadResponse {
  document: DocumentAttachment;
  message: string;
}

export interface DocumentListResponse {
  documents: DocumentAttachment[];
  total: number;
}

export interface RAGSearchResult {
  content: string;
  filename: string;
  chunk_index: number;
  score: number;
  page_number?: number;
}

export interface RAGSearchResponse {
  results: RAGSearchResult[];
  query: string;
  documents_searched: number;
}

// Supported file types for upload
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
};

export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.md', '.csv'];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function isValidFileType(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}
