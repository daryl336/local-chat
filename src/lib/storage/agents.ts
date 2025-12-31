/**
 * Agent storage - now uses backend API instead of IndexedDB
 */

import { storageApi, AgentConfig } from '@/lib/api/storage';
import { AgentConfiguration, AgentCategory } from '@/types/agent';
import { DEFAULT_AGENT_TEMPLATES } from '@/lib/constants';

// Convert backend format to frontend format
function toFrontendAgent(agent: AgentConfig): AgentConfiguration {
  // Normalize category to lowercase to match frontend type system
  const normalizedCategory = agent.category?.toLowerCase() as AgentCategory;
  const validCategories: AgentCategory[] = ['general', 'creative', 'technical', 'research', 'business', 'custom'];

  return {
    id: agent.id,
    name: agent.name,
    description: agent.description || '',
    systemPrompt: agent.system_prompt,
    category: validCategories.includes(normalizedCategory) ? normalizedCategory : 'custom',
    isTemplate: false, // Backend agents are never templates
    createdAt: new Date(agent.created_at),
    updatedAt: new Date(agent.updated_at),
  };
}

export async function initializeDefaultAgents(): Promise<void> {
  // Check if we already have agents
  const existingAgents = await storageApi.getAllAgents();

  if (existingAgents.length === 0) {
    // Create default agents from templates
    for (const template of DEFAULT_AGENT_TEMPLATES) {
      await storageApi.createAgent({
        name: template.name,
        description: template.description,
        system_prompt: template.systemPrompt,
        category: template.category,
      });
    }
  }
}

export async function createAgent(
  data: Omit<AgentConfiguration, 'id' | 'isTemplate' | 'createdAt' | 'updatedAt'>
): Promise<AgentConfiguration> {
  const agent = await storageApi.createAgent({
    name: data.name,
    description: data.description,
    system_prompt: data.systemPrompt,
    category: data.category,
  });
  return toFrontendAgent(agent);
}

export async function getAgent(id: string): Promise<AgentConfiguration | undefined> {
  try {
    const agent = await storageApi.getAgent(id);
    return toFrontendAgent(agent);
  } catch {
    return undefined;
  }
}

export async function getAllAgents(): Promise<AgentConfiguration[]> {
  const agents = await storageApi.getAllAgents();
  return agents.map(toFrontendAgent);
}

export async function getTemplateAgents(): Promise<AgentConfiguration[]> {
  // Backend doesn't have templates - return empty array
  return [];
}

export async function getCustomAgents(): Promise<AgentConfiguration[]> {
  // All backend agents are "custom" (user-created)
  return getAllAgents();
}

export async function getAgentsByCategory(category: AgentCategory): Promise<AgentConfiguration[]> {
  const allAgents = await getAllAgents();
  return allAgents.filter(agent => agent.category === category);
}

export async function updateAgent(
  id: string,
  updates: Partial<Omit<AgentConfiguration, 'id' | 'isTemplate' | 'createdAt'>>
): Promise<void> {
  await storageApi.updateAgent(id, {
    name: updates.name,
    description: updates.description,
    system_prompt: updates.systemPrompt,
    category: updates.category,
  });
}

export async function deleteAgent(id: string): Promise<void> {
  await storageApi.deleteAgent(id);
}

export async function duplicateAgent(id: string, newName?: string): Promise<AgentConfiguration> {
  const agent = await getAgent(id);
  if (!agent) throw new Error('Agent not found');

  return createAgent({
    name: newName || `${agent.name} (Copy)`,
    description: agent.description,
    systemPrompt: agent.systemPrompt,
    category: agent.category,
  });
}

export async function searchAgents(query: string): Promise<AgentConfiguration[]> {
  const allAgents = await getAllAgents();
  const lowerQuery = query.toLowerCase();

  return allAgents.filter(agent =>
    agent.name.toLowerCase().includes(lowerQuery) ||
    agent.description.toLowerCase().includes(lowerQuery)
  );
}
