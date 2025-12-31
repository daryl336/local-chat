import { apiRequest } from './client';
import {
  ModelStatus,
  LocalModelInfo,
  RemoteModelInfo,
  LoadResponse,
  DownloadResponse,
  HealthResponse,
  ModelList,
} from '@/types/model';

export const modelsApi = {
  /**
   * Get the current model status
   */
  getStatus: () => apiRequest<ModelStatus>('/models/status'),

  /**
   * List all locally downloaded models
   */
  listLocal: () => apiRequest<LocalModelInfo[]>('/models/local'),

  /**
   * List currently loaded models (OpenAI-compatible)
   */
  list: () => apiRequest<ModelList>('/v1/models'),

  /**
   * Search for models on HuggingFace (mlx-community)
   */
  search: (query: string, limit: number = 20) =>
    apiRequest<RemoteModelInfo[]>(`/models/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  /**
   * Get info about a specific remote model
   */
  getInfo: (repoId: string) =>
    apiRequest<RemoteModelInfo>(`/models/info/${encodeURIComponent(repoId)}`),

  /**
   * Load a model into memory
   */
  load: (model: string) =>
    apiRequest<LoadResponse>('/models/load', {
      method: 'POST',
      body: JSON.stringify({ model }),
    }),

  /**
   * Unload the current model from memory
   */
  unload: () =>
    apiRequest<{ message: string }>('/models/unload', {
      method: 'POST',
    }),

  /**
   * Download a model from HuggingFace
   */
  download: (repoId: string) =>
    apiRequest<DownloadResponse>('/models/download', {
      method: 'POST',
      body: JSON.stringify({ repo_id: repoId }),
    }),

  /**
   * Delete a locally downloaded model
   */
  delete: (repoId: string) =>
    apiRequest<{ message: string }>(`/models/${encodeURIComponent(repoId)}`, {
      method: 'DELETE',
    }),

  /**
   * Health check
   */
  health: () => apiRequest<HealthResponse>('/health'),
};
