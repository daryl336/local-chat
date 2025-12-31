'use client';

import { useState, useEffect, useCallback } from 'react';
import { AgentConfiguration, AgentCategory } from '@/types/agent';
import * as agentStorage from '@/lib/storage/agents';

export function useAgents() {
  const [agents, setAgents] = useState<AgentConfiguration[]>([]);
  const [templates, setTemplates] = useState<AgentConfiguration[]>([]);
  const [customAgents, setCustomAgents] = useState<AgentConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAgents = useCallback(async () => {
    try {
      setIsLoading(true);

      // Initialize default templates if needed
      await agentStorage.initializeDefaultAgents();

      const [allAgents, templateList, customList] = await Promise.all([
        agentStorage.getAllAgents(),
        agentStorage.getTemplateAgents(),
        agentStorage.getCustomAgents(),
      ]);

      setAgents(allAgents);
      setTemplates(templateList);
      setCustomAgents(customList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load agents'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const createAgent = useCallback(async (
    data: Omit<AgentConfiguration, 'id' | 'isTemplate' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newAgent = await agentStorage.createAgent(data);
      setAgents((prev) => [newAgent, ...prev]);
      setCustomAgents((prev) => [newAgent, ...prev]);
      return newAgent;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create agent'));
      throw err;
    }
  }, []);

  const updateAgent = useCallback(async (
    id: string,
    updates: Partial<Omit<AgentConfiguration, 'id' | 'isTemplate' | 'createdAt'>>
  ) => {
    try {
      await agentStorage.updateAgent(id, updates);
      const updatedAgent = { ...updates, updatedAt: new Date() };

      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === id ? { ...agent, ...updatedAgent } : agent
        )
      );
      setCustomAgents((prev) =>
        prev.map((agent) =>
          agent.id === id ? { ...agent, ...updatedAgent } : agent
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update agent'));
      throw err;
    }
  }, []);

  const deleteAgent = useCallback(async (id: string) => {
    try {
      await agentStorage.deleteAgent(id);
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
      setCustomAgents((prev) => prev.filter((agent) => agent.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete agent'));
      throw err;
    }
  }, []);

  const duplicateAgent = useCallback(async (id: string, newName?: string) => {
    try {
      const newAgent = await agentStorage.duplicateAgent(id, newName);
      setAgents((prev) => [newAgent, ...prev]);
      setCustomAgents((prev) => [newAgent, ...prev]);
      return newAgent;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to duplicate agent'));
      throw err;
    }
  }, []);

  const getAgentById = useCallback((id: string) => {
    return agents.find((agent) => agent.id === id);
  }, [agents]);

  const getAgentsByCategory = useCallback((category: AgentCategory) => {
    return agents.filter((agent) => agent.category === category);
  }, [agents]);

  const refreshAgents = useCallback(() => {
    loadAgents();
  }, [loadAgents]);

  return {
    agents,
    templates,
    customAgents,
    isLoading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    duplicateAgent,
    getAgentById,
    getAgentsByCategory,
    refreshAgents,
  };
}
