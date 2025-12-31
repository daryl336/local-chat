'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Bot, Zap, ArrowRight } from 'lucide-react';
import { getTimeBasedGreeting, getRandomGreetingMessage } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';

interface WelcomeScreenProps {
  userName?: string;
  onQuickAction?: (action: string) => void;
}

export function WelcomeScreen({ userName, onQuickAction }: WelcomeScreenProps) {
  // Use state to avoid hydration mismatch - these functions use Date/Math.random
  const [greeting, setGreeting] = useState('Hello');
  const [subGreeting, setSubGreeting] = useState('How can I assist you?');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setSubGreeting(getRandomGreetingMessage());
    setMounted(true);
  }, []);

  const quickActions = [
    {
      icon: MessageSquare,
      label: 'Start a conversation',
      description: 'Chat about anything',
      action: 'chat',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: Bot,
      label: 'Use an agent',
      description: 'Choose a specialized assistant',
      action: 'agent',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
    },
    {
      icon: Zap,
      label: 'Quick question',
      description: 'Get a fast answer',
      action: 'quick',
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className={cn(
      'flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 min-h-0',
      mounted && 'animate-fade-in'
    )}>
      {/* Logo with glow effect */}
      <div className="mb-6 sm:mb-10 relative">
        <div className="absolute inset-0 bg-primary-500/30 blur-2xl rounded-full scale-150" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center shadow-2xl animate-pulse-glow">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
      </div>

      {/* Greeting */}
      <div className="text-center mb-8 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 tracking-tight">
          <span className="gradient-text">{greeting}</span>
          {userName && <span className="text-content">, {userName}</span>}
        </h1>
        <p className="text-base sm:text-lg text-content-secondary font-light">
          {subGreeting}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 w-full max-w-3xl mb-8 sm:mb-14">
        {quickActions.map((action, index) => (
          <button
            key={action.action}
            onClick={() => onQuickAction?.(action.action)}
            className={cn(
              'group relative p-4 sm:p-5 rounded-2xl text-left',
              'glass card-interactive',
              'hover:border-primary-500/30',
              mounted && 'animate-slide-up'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient overlay on hover */}
            <div className={cn(
              'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              action.gradient
            )} />

            <div className="relative flex items-center gap-3 sm:block">
              <div className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center sm:mb-4 flex-shrink-0',
                'bg-gradient-to-br',
                action.gradient,
                'group-hover:scale-110 transition-transform duration-300'
              )}>
                <action.icon className={cn('w-5 h-5 sm:w-6 sm:h-6', action.iconColor)} />
              </div>
              <div className="flex-1 sm:flex-none">
                <h3 className="font-semibold text-content mb-0.5 sm:mb-1.5 flex items-center gap-2 text-sm sm:text-base">
                  {action.label}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary-400 hidden sm:block" />
                </h3>
                <p className="text-xs sm:text-sm text-content-muted">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Suggested prompts */}
      <div className="w-full max-w-2xl">
        <p className="text-xs uppercase tracking-wider text-content-muted text-center mb-4 font-medium">
          Popular prompts
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'Explain quantum computing simply',
            'Write a Python function',
            'Help me brainstorm ideas',
            'Summarize a complex topic',
          ].map((prompt, index) => (
            <button
              key={prompt}
              onClick={() => onQuickAction?.(`prompt:${prompt}`)}
              className={cn(
                'px-4 py-2 text-sm rounded-full',
                'bg-surface-secondary/50 border border-border',
                'hover:bg-primary-500/10 hover:border-primary-500/30 hover:text-primary-300',
                'transition-all duration-200 text-content-secondary',
                mounted && 'animate-slide-up'
              )}
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
