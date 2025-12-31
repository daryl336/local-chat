'use client';

import { useState, useEffect, useCallback } from 'react';
import { modelsApi } from '@/lib/api/models';
import { LocalModelInfo, ModelStatus } from '@/types/model';
import { useChatStore } from '@/stores/chatStore';

export function useModels() {
  const [localModels, setLocalModels] = useState<LocalModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { currentModel, isModelLoaded, isModelLoading, setModel, setModelLoading } = useChatStore();

  // Check model status
  const checkStatus = useCallback(async () => {
    try {
      const status = await modelsApi.getStatus();
      setModel(status.current_model, status.loaded);
      return status;
    } catch (err) {
      // API might not be running
      setModel(null, false);
      return null;
    }
  }, [setModel]);

  // Load local models list
  const loadLocalModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const models = await modelsApi.listLocal();
      setLocalModels(models);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load models'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load a model
  const loadModel = useCallback(async (model: string) => {
    try {
      setModelLoading(true);
      await modelsApi.load(model);
      setModel(model, true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load model'));
      throw err;
    } finally {
      setModelLoading(false);
    }
  }, [setModel, setModelLoading]);

  // Unload current model
  const unloadModel = useCallback(async () => {
    try {
      setModelLoading(true);
      await modelsApi.unload();
      setModel(null, false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unload model'));
      throw err;
    } finally {
      setModelLoading(false);
    }
  }, [setModel, setModelLoading]);

  // Search for models
  const searchModels = useCallback(async (query: string) => {
    try {
      return await modelsApi.search(query);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search models'));
      throw err;
    }
  }, []);

  // Download a model
  const downloadModel = useCallback(async (repoId: string) => {
    try {
      const result = await modelsApi.download(repoId);
      await loadLocalModels();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to download model'));
      throw err;
    }
  }, [loadLocalModels]);

  // Delete a model
  const deleteModel = useCallback(async (repoId: string) => {
    try {
      await modelsApi.delete(repoId);
      setLocalModels((prev) => prev.filter((m) => m.repo_id !== repoId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete model'));
      throw err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkStatus();
    loadLocalModels();
  }, [checkStatus, loadLocalModels]);

  return {
    currentModel,
    isModelLoaded,
    isModelLoading,
    localModels,
    isLoading,
    error,
    checkStatus,
    loadModel,
    unloadModel,
    searchModels,
    downloadModel,
    deleteModel,
    refreshModels: loadLocalModels,
  };
}
