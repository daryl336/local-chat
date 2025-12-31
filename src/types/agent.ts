export type AgentCategory =
  | 'general'
  | 'creative'
  | 'technical'
  | 'research'
  | 'business'
  | 'custom';

export interface AgentConfiguration {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  category: AgentCategory;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CATEGORY_COLORS: Record<AgentCategory, { bg: string; text: string; border: string }> = {
  general: {
    bg: 'bg-primary-500/20',
    text: 'text-primary-400',
    border: 'border-primary-500/30',
  },
  creative: {
    bg: 'bg-accent-purple/20',
    text: 'text-accent-purple',
    border: 'border-accent-purple/30',
  },
  technical: {
    bg: 'bg-accent-cyan/20',
    text: 'text-accent-cyan',
    border: 'border-accent-cyan/30',
  },
  research: {
    bg: 'bg-accent-amber/20',
    text: 'text-accent-amber',
    border: 'border-accent-amber/30',
  },
  business: {
    bg: 'bg-accent-emerald/20',
    text: 'text-accent-emerald',
    border: 'border-accent-emerald/30',
  },
  custom: {
    bg: 'bg-accent-pink/20',
    text: 'text-accent-pink',
    border: 'border-accent-pink/30',
  },
};

export const CATEGORY_ICONS: Record<AgentCategory, string> = {
  general: 'MessageCircle',
  creative: 'Palette',
  technical: 'Code',
  research: 'Search',
  business: 'Briefcase',
  custom: 'Sparkles',
};
