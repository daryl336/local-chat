import Dexie, { type EntityTable } from 'dexie';
import { ChatSession } from '@/types/chat';
import { AgentConfiguration } from '@/types/agent';

interface AppSettings {
  id: string;
  preferredModel: string | null;
  sidebarExpanded: boolean;
  lastActiveAgentId: string | null;
  lastActiveChatId: string | null;
}

const db = new Dexie('lumina-db') as Dexie & {
  chats: EntityTable<ChatSession, 'id'>;
  agents: EntityTable<AgentConfiguration, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

db.version(1).stores({
  chats: 'id, updatedAt, agentId',
  agents: 'id, category, isTemplate',
  settings: 'id',
});

export { db };
export type { AppSettings };
