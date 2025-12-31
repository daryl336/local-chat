'use client';

import { useState, useEffect } from 'react';
import { X, Cpu, Trash2, HardDrive, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useModels, useChats } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'models' | 'data'>('general');
  const { localModels, currentModel, isModelLoaded } = useModels();
  const { chats, clearAllChats } = useChats();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter chat models
  const chatModels = localModels.filter(
    (m) =>
      !m.repo_id.toLowerCase().includes('embed') &&
      !m.repo_id.toLowerCase().includes('bge')
  );

  const totalStorageGB = chatModels.reduce((acc, m) => acc + m.size_gb, 0);

  const handleClearAllChats = async () => {
    await clearAllChats();
    setShowClearConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] mx-4 rounded-2xl glass-strong border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-content">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-tertiary/50 transition-colors"
          >
            <X className="w-5 h-5 text-content-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-border/50">
          {(['general', 'models', 'data'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-content-secondary hover:bg-surface-tertiary/50'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-content mb-2">About</h3>
                <div className="p-4 rounded-xl bg-surface-tertiary/30 border border-border/50">
                  <p className="text-sm text-content-secondary">
                    <span className="font-semibold text-content">Lumina</span> is a local-first chat interface
                    for your MLX language models. All data is stored locally in your browser.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-content mb-2">Current Model</h3>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-tertiary/30 border border-border/50">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    isModelLoaded ? 'bg-accent-emerald/20' : 'bg-surface-tertiary'
                  )}>
                    <Cpu className={cn(
                      'w-5 h-5',
                      isModelLoaded ? 'text-accent-emerald' : 'text-content-muted'
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">
                      {currentModel ? currentModel.split('/').pop() : 'No model loaded'}
                    </p>
                    <p className="text-xs text-content-muted">
                      {isModelLoaded ? 'Connected and ready' : 'Load a model to start chatting'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-content mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-surface-tertiary/30 border border-border/50">
                    <p className="text-2xl font-bold text-content">{chats.length}</p>
                    <p className="text-xs text-content-muted">Total Chats</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-tertiary/30 border border-border/50">
                    <p className="text-2xl font-bold text-content">{chatModels.length}</p>
                    <p className="text-xs text-content-muted">Models Available</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-content">Downloaded Models</h3>
                <span className="text-xs text-content-muted">
                  {totalStorageGB.toFixed(1)} GB total
                </span>
              </div>

              <div className="space-y-2">
                {chatModels.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-surface-tertiary/30 border border-border/50">
                    <HardDrive className="w-10 h-10 text-content-muted/30 mx-auto mb-3" />
                    <p className="text-sm text-content-muted">No models downloaded</p>
                  </div>
                ) : (
                  chatModels.map((model) => {
                    const isActive = model.repo_id === currentModel;
                    const modelName = model.repo_id.split('/').pop() || model.repo_id;

                    return (
                      <div
                        key={model.repo_id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border transition-all',
                          isActive
                            ? 'bg-accent-emerald/10 border-accent-emerald/30'
                            : 'bg-surface-tertiary/30 border-border/50'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          isActive ? 'bg-accent-emerald/20' : 'bg-surface-tertiary'
                        )}>
                          <Cpu className={cn(
                            'w-5 h-5',
                            isActive ? 'text-accent-emerald' : 'text-content-muted'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-content truncate">
                            {modelName}
                          </p>
                          <p className="text-xs text-content-muted">
                            {model.size_gb.toFixed(1)} GB
                            {isActive && <span className="text-accent-emerald ml-2">Active</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-content mb-2">Chat History</h3>
                <p className="text-sm text-content-muted mb-4">
                  All your chat history is stored locally in your browser using IndexedDB.
                </p>

                {!showClearConfirm ? (
                  <Button
                    variant="ghost"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-accent-red hover:bg-accent-red/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Chats
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-accent-red/10 border border-accent-red/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-content mb-2">
                          Are you sure you want to delete all {chats.length} chats?
                        </p>
                        <p className="text-xs text-content-muted mb-4">
                          This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowClearConfirm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleClearAllChats}
                            className="bg-accent-red hover:bg-accent-red/80"
                          >
                            Delete All
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-content mb-2">Storage Info</h3>
                <div className="p-4 rounded-xl bg-surface-tertiary/30 border border-border/50">
                  <p className="text-sm text-content-secondary">
                    Your data is stored in your browser&apos;s IndexedDB. Clearing browser data
                    or using private browsing mode will remove your chat history.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}