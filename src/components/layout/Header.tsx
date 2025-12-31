'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, Cpu, Loader2, ChevronDown, Check, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui';
import { SettingsModal } from '@/components/settings';
import { useModels } from '@/hooks';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { currentModel, isModelLoaded, isModelLoading, localModels, loadModel } = useModels();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = async (repoId: string) => {
    if (repoId === currentModel) {
      setIsDropdownOpen(false);
      return;
    }
    try {
      await loadModel(repoId);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to load model:', error);
    }
  };

  // Filter to only show chat models (exclude embedding models)
  const chatModels = localModels.filter(m =>
    !m.repo_id.toLowerCase().includes('embed') &&
    !m.repo_id.toLowerCase().includes('bge')
  );

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 glass">
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-lg font-semibold text-content truncate max-w-[400px]">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Model selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isModelLoading}
            className={cn(
              'flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-200',
              'bg-surface-tertiary/50 border border-border hover:bg-surface-tertiary/80',
              isModelLoaded && 'border-accent-emerald/30 bg-accent-emerald/5 hover:bg-accent-emerald/10',
              isDropdownOpen && 'ring-2 ring-primary-500/30',
              isModelLoading && 'cursor-wait'
            )}
          >
            <div className="relative">
              {isModelLoading ? (
                <Loader2 className="w-4 h-4 text-accent-amber animate-spin" />
              ) : (
                <Cpu className={cn(
                  'w-4 h-4',
                  isModelLoaded ? 'text-accent-emerald' : 'text-content-muted'
                )} />
              )}
              <div
                className={cn(
                  'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-surface-tertiary',
                  isModelLoading && 'bg-accent-amber',
                  isModelLoaded && 'bg-accent-emerald',
                  !isModelLoaded && !isModelLoading && 'bg-accent-red'
                )}
              />
            </div>
            <div className="flex flex-col items-start">
              <span className={cn(
                'text-xs font-medium leading-tight',
                isModelLoaded ? 'text-content' : 'text-content-secondary'
              )}>
                {isModelLoading ? 'Loading model...' : currentModel ? currentModel.split('/').pop() : 'Select model'}
              </span>
              {isModelLoaded && (
                <span className="text-[10px] text-accent-emerald">Connected</span>
              )}
            </div>
            <ChevronDown className={cn(
              'w-4 h-4 text-content-muted transition-transform duration-200',
              isDropdownOpen && 'rotate-180'
            )} />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 py-2 rounded-xl glass-strong border border-border shadow-xl z-50">
              <div className="px-3 pb-2 mb-2 border-b border-border/50">
                <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">
                  Available Models
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {chatModels.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <HardDrive className="w-8 h-8 text-content-muted/30 mx-auto mb-2" />
                    <p className="text-sm text-content-muted">No models downloaded</p>
                  </div>
                ) : (
                  chatModels.map((model) => {
                    const isActive = model.repo_id === currentModel;
                    const modelName = model.repo_id.split('/').pop() || model.repo_id;

                    return (
                      <button
                        key={model.repo_id}
                        onClick={() => handleSelectModel(model.repo_id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-150',
                          'hover:bg-surface-tertiary/50',
                          isActive && 'bg-primary-500/10'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          isActive ? 'bg-accent-emerald/20' : 'bg-surface-tertiary/50'
                        )}>
                          <Cpu className={cn(
                            'w-4 h-4',
                            isActive ? 'text-accent-emerald' : 'text-content-muted'
                          )} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            isActive ? 'text-content' : 'text-content-secondary'
                          )}>
                            {modelName}
                          </p>
                          <p className="text-[11px] text-content-muted">
                            {model.size_gb.toFixed(1)} GB
                          </p>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-[18px] h-[18px]" />
        </Button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
}
