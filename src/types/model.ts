export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelList {
  object: string;
  data: ModelInfo[];
}

export interface LocalModelInfo {
  repo_id: string;
  size_gb: number;
  last_accessed: string;
  path: string;
  revision_count: number;
}

export interface RemoteModelInfo {
  repo_id: string;
  downloads: number;
  likes: number;
  size_gb: number | null;
  tags: string[];
}

export interface ModelStatus {
  loaded: boolean;
  current_model: string | null;
}

export interface LoadRequest {
  model: string;
}

export interface LoadResponse {
  message: string;
  model: string;
}

export interface DownloadRequest {
  repo_id: string;
}

export interface DownloadResponse {
  message: string;
  path: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  current_model: string | null;
}
