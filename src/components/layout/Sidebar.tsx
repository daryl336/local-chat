'use client';

import { useRouter } from 'next/navigation';
import {
  PanelLeftClose,
  PanelLeft,
  MessageSquarePlus,
  Bot,
  MessageCircle,
  Search,
  Trash2,
  Pencil,
  Sparkles,
  Plus,
  Settings2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useChatStore } from '@/stores/chatStore';
import { useAgents } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { AgentCategory, CATEGORY_COLORS } from '@/types/agent';
import { ChatSession } from '@/types/chat';

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
}

function groupChatsByDate(chats: ChatSession[]): Record<string, ChatSession[]> {
  const groups: Record<string, ChatSession[]> = {};

  chats.forEach((chat) => {
    const label = formatDate(chat.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(chat);
  });

  return groups;
}

interface SidebarProps {
  chats: ChatSession[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onSelectAgent: (agentId: string | null) => void;
  onDeleteChat: (chatId: string) => Promise<void>;
}

export function Sidebar({ chats, onNewChat, onSelectChat, onSelectAgent, onDeleteChat }: SidebarProps) {
  const router = useRouter();
  const { isExpanded, isMobileOpen, searchQuery, toggleSidebar, closeMobileSidebar, setSearchQuery, openAgentModal } = useSidebarStore();
  const { currentChatId, activeAgentId, setActiveAgent } = useChatStore();
  const { templates, customAgents } = useAgents();

  // Auto-close mobile sidebar on chat/agent selection
  const handleMobileClose = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      closeMobileSidebar();
    }
  };

  const filteredChats = searchQuery
    ? chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  const groupedChats = groupChatsByDate(filteredChats);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDeleteChat(chatId);
  };

  const handleAgentClick = (agentId: string) => {
    if (activeAgentId === agentId) {
      setActiveAgent(null);
      onSelectAgent(null);
    } else {
      setActiveAgent(agentId);
      onSelectAgent(agentId);
    }
    handleMobileClose();
  };

  const handleChatClick = (chatId: string) => {
    onSelectChat(chatId);
    handleMobileClose();
  };

  const handleNewChatClick = () => {
    onNewChat();
    handleMobileClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          'h-full flex flex-col glass-strong transition-all duration-300 ease-in-out',
          // Desktop: inline with width toggle
          'hidden md:flex',
          isExpanded ? 'md:w-72' : 'md:w-[68px]',
          // Mobile: fixed overlay from left
          isMobileOpen && 'fixed inset-y-0 left-0 z-50 flex w-72'
        )}
      >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {(isExpanded || isMobileOpen) && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-content tracking-tight">Lumina</span>
          </div>
        )}
        {/* Mobile close button */}
        {isMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileSidebar}
            className="h-9 w-9 rounded-lg md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 rounded-lg hidden md:flex"
        >
          {isExpanded ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={handleNewChatClick}
          className={cn(
            'w-full gap-2 rounded-xl h-11 font-medium',
            'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400',
            'shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30',
            !isExpanded && 'px-0'
          )}
          variant="primary"
        >
          <MessageSquarePlus className="w-5 h-5" />
          {isExpanded && <span>New Chat</span>}
        </Button>
      </div>

      {/* Search (expanded only) */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-tertiary/50 border border-border text-sm text-content placeholder:text-content-muted focus:outline-none focus:border-primary-500/50 focus:bg-surface-tertiary transition-all"
            />
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3">
        {/* Agent Configurations */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-3">
            {isExpanded && (
              <span className="text-[11px] font-semibold text-content-muted uppercase tracking-widest">
                Agents
              </span>
            )}
            {isExpanded && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => router.push('/agents')}
                  className="p-1 text-content-muted hover:text-content-secondary transition-colors"
                  title="Manage Agents"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openAgentModal()}
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            {/* Templates */}
            {templates.map((agent) => (
              <AgentItem
                key={agent.id}
                name={agent.name}
                category={agent.category}
                isActive={activeAgentId === agent.id}
                isExpanded={isExpanded}
                isTemplate
                onClick={() => handleAgentClick(agent.id)}
              />
            ))}

            {/* Custom Agents */}
            {customAgents.map((agent) => (
              <AgentItem
                key={agent.id}
                name={agent.name}
                category={agent.category}
                isActive={activeAgentId === agent.id}
                isExpanded={isExpanded}
                onClick={() => handleAgentClick(agent.id)}
                onEdit={() => openAgentModal(agent.id)}
              />
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="py-3 border-t border-border/50">
          {isExpanded && (
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-widest">
              History
            </span>
          )}

          <div className="mt-3 space-y-4">
            {Object.entries(groupedChats).map(([dateLabel, chatGroup]) => (
              <div key={dateLabel}>
                {isExpanded && (
                  <span className="text-[10px] text-content-muted/70 uppercase tracking-wider font-medium px-2">
                    {dateLabel}
                  </span>
                )}
                <div className="mt-2 space-y-0.5">
                  {chatGroup.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      title={chat.title}
                      isActive={currentChatId === chat.id}
                      isExpanded={isExpanded}
                      onClick={() => handleChatClick(chat.id)}
                      onDelete={(e) => handleDeleteChat(chat.id, e)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {filteredChats.length === 0 && isExpanded && (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-content-muted/30 mx-auto mb-2" />
                <p className="text-sm text-content-muted">No chats yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}

interface AgentItemProps {
  name: string;
  category: AgentCategory;
  isActive: boolean;
  isExpanded: boolean;
  isTemplate?: boolean;
  onClick: () => void;
  onEdit?: () => void;
}

function AgentItem({ name, category, isActive, isExpanded, isTemplate, onClick, onEdit }: AgentItemProps) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.custom;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 group cursor-pointer',
        isActive
          ? 'bg-primary-500/15 border border-primary-500/30 shadow-sm'
          : 'hover:bg-surface-tertiary/50 border border-transparent'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200',
        colors.bg,
        'group-hover:scale-105'
      )}>
        <Bot className={cn('w-4 h-4', colors.text)} />
      </div>
      {isExpanded && (
        <>
          <span className={cn(
            'flex-1 text-sm truncate text-left font-medium',
            isActive ? 'text-content' : 'text-content-secondary'
          )}>
            {name}
          </span>
          {!isTemplate && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-surface-hover rounded-lg transition-all"
            >
              <Pencil className="w-3 h-3 text-content-muted" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

interface ChatItemProps {
  title: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ChatItem({ title, isActive, isExpanded, onClick, onDelete }: ChatItemProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 group cursor-pointer',
        isActive
          ? 'bg-surface-tertiary/80'
          : 'hover:bg-surface-tertiary/40'
      )}
    >
      <MessageCircle className={cn(
        'w-4 h-4 flex-shrink-0',
        isActive ? 'text-primary-400' : 'text-content-muted'
      )} />
      {isExpanded && (
        <>
          <span className={cn(
            'flex-1 text-sm truncate text-left',
            isActive ? 'text-content font-medium' : 'text-content-secondary'
          )}>
            {title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-accent-red/20 rounded-lg transition-all"
          >
            <Trash2 className="w-3 h-3 text-accent-red" />
          </button>
        </>
      )}
    </div>
  );
}
