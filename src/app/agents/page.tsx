'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ArrowLeft,
  MessageCircle,
  Palette,
  Code,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { AgentModal } from '@/components/agents';
import { useAgents } from '@/hooks';
import { useSidebarStore } from '@/stores/sidebarStore';
import { AgentCategory, CATEGORY_COLORS } from '@/types/agent';
import { cn } from '@/lib/utils/cn';

const CATEGORY_ICONS: Record<AgentCategory, React.ReactNode> = {
  general: <MessageCircle className="w-5 h-5" />,
  creative: <Palette className="w-5 h-5" />,
  technical: <Code className="w-5 h-5" />,
  research: <Search className="w-5 h-5" />,
  business: <Briefcase className="w-5 h-5" />,
  custom: <Sparkles className="w-5 h-5" />,
};

export default function AgentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { agents, deleteAgent, duplicateAgent, refreshAgents } = useAgents();
  const { openAgentModal } = useSidebarStore();

  // Filter agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || agent.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteAgent(id);
      setDeleteConfirmId(null);
      refreshAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateAgent(id);
      refreshAgents();
    } catch (error) {
      console.error('Failed to duplicate agent:', error);
    }
  };

  const categories: Array<{ value: AgentCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'general', label: 'General' },
    { value: 'creative', label: 'Creative' },
    { value: 'technical', label: 'Technical' },
    { value: 'research', label: 'Research' },
    { value: 'business', label: 'Business' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg hover:bg-surface-tertiary/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-content-secondary" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-content">Agents</h1>
                <p className="text-sm text-content-muted">
                  Manage your AI assistants and their system prompts
                </p>
              </div>
            </div>
            <Button onClick={() => openAgentModal()}>
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-content placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize',
                  selectedCategory === cat.value
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-surface-secondary text-content-secondary hover:bg-surface-tertiary border border-transparent'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-tertiary/50 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-content-muted/50" />
            </div>
            <h3 className="text-lg font-medium text-content mb-2">No agents found</h3>
            <p className="text-content-muted mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first agent to get started'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button onClick={() => openAgentModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const categoryColor = CATEGORY_COLORS[agent.category];

              return (
                <div
                  key={agent.id}
                  className="group relative p-5 rounded-2xl bg-surface-secondary border border-border hover:border-border/80 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        categoryColor.bg
                      )}
                    >
                      <span className={categoryColor.text}>
                        {CATEGORY_ICONS[agent.category]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-content truncate">{agent.name}</h3>
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 rounded text-xs font-medium capitalize',
                          categoryColor.bg,
                          categoryColor.text
                        )}
                      >
                        {agent.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-content-secondary line-clamp-2 mb-4">
                    {agent.description || 'No description'}
                  </p>

                  {/* System prompt preview */}
                  <div className="p-3 rounded-lg bg-surface-tertiary/50 mb-4">
                    <p className="text-xs text-content-muted font-mono line-clamp-3">
                      {agent.systemPrompt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAgentModal(agent.id)}
                      className="flex-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(agent.id)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    {deleteConfirmId === agent.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(agent.id)}
                          className="text-accent-red hover:bg-accent-red/10"
                        >
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(agent.id)}
                        className="text-accent-red hover:bg-accent-red/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Template badge */}
                  {agent.isTemplate && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 text-xs font-medium">
                      Template
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent Modal */}
      <AgentModal />
    </div>
  );
}
