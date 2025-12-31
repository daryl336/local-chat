import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { AgentConfiguration, AgentCategory } from '@/types/agent';
import { DEFAULT_AGENT_TEMPLATES } from '@/lib/constants';

export async function initializeDefaultAgents(): Promise<void> {
  const existingTemplates = await db.agents.where('isTemplate').equals(1).toArray();

  if (existingTemplates.length === 0) {
    const now = new Date();
    const templates = DEFAULT_AGENT_TEMPLATES.map(template => ({
      ...template,
      createdAt: now,
      updatedAt: now,
    }));

    await db.agents.bulkAdd(templates);
  }
}

export async function createAgent(
  data: Omit<AgentConfiguration, 'id' | 'isTemplate' | 'createdAt' | 'updatedAt'>
): Promise<AgentConfiguration> {
  const now = new Date();
  const agent: AgentConfiguration = {
    ...data,
    id: uuidv4(),
    isTemplate: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.agents.add(agent);
  return agent;
}

export async function getAgent(id: string): Promise<AgentConfiguration | undefined> {
  return db.agents.get(id);
}

export async function getAllAgents(): Promise<AgentConfiguration[]> {
  return db.agents.orderBy('updatedAt').reverse().toArray();
}

export async function getTemplateAgents(): Promise<AgentConfiguration[]> {
  return db.agents.where('isTemplate').equals(1).toArray();
}

export async function getCustomAgents(): Promise<AgentConfiguration[]> {
  return db.agents.where('isTemplate').equals(0).toArray();
}

export async function getAgentsByCategory(category: AgentCategory): Promise<AgentConfiguration[]> {
  return db.agents.where('category').equals(category).toArray();
}

export async function updateAgent(
  id: string,
  updates: Partial<Omit<AgentConfiguration, 'id' | 'isTemplate' | 'createdAt'>>
): Promise<void> {
  const agent = await getAgent(id);
  if (!agent) throw new Error('Agent not found');

  // Don't allow editing templates
  if (agent.isTemplate) {
    throw new Error('Cannot edit template agents');
  }

  await db.agents.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteAgent(id: string): Promise<void> {
  const agent = await getAgent(id);
  if (!agent) throw new Error('Agent not found');

  // Don't allow deleting templates
  if (agent.isTemplate) {
    throw new Error('Cannot delete template agents');
  }

  await db.agents.delete(id);
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
