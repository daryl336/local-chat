'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input, TextArea, Select } from '@/components/ui';
import { AgentConfiguration, AgentCategory } from '@/types/agent';
import { useAgents } from '@/hooks';
import { useSidebarStore } from '@/stores/sidebarStore';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'creative', label: 'Creative' },
  { value: 'technical', label: 'Technical' },
  { value: 'research', label: 'Research' },
  { value: 'business', label: 'Business' },
  { value: 'custom', label: 'Custom' },
];

export function AgentModal() {
  const { isAgentModalOpen, editingAgentId, closeAgentModal } = useSidebarStore();
  const { agents, createAgent, updateAgent } = useAgents();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [category, setCategory] = useState<AgentCategory>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing agent data when editing
  useEffect(() => {
    if (editingAgentId && isAgentModalOpen) {
      const agent = agents.find((a) => a.id === editingAgentId);
      if (agent) {
        setName(agent.name);
        setDescription(agent.description);
        setSystemPrompt(agent.systemPrompt);
        setCategory(agent.category);
      }
    } else if (isAgentModalOpen) {
      // Reset form for new agent
      setName('');
      setDescription('');
      setSystemPrompt('');
      setCategory('custom');
    }
  }, [editingAgentId, isAgentModalOpen, agents]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (editingAgentId) {
        await updateAgent(editingAgentId, {
          name: name.trim(),
          description: description.trim(),
          systemPrompt: systemPrompt.trim(),
          category,
        });
      } else {
        await createAgent({
          name: name.trim(),
          description: description.trim(),
          systemPrompt: systemPrompt.trim(),
          category,
        });
      }

      closeAgentModal();
    } catch (err) {
      console.error('Failed to save agent:', err);
      setErrors({ submit: 'Failed to save agent. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    closeAgentModal();
  };

  return (
    <Modal
      isOpen={isAgentModalOpen}
      onClose={handleClose}
      title={editingAgentId ? 'Edit Agent' : 'Create Agent'}
      size="lg"
    >
      <div className="space-y-3 sm:space-y-4">
        <Input
          label="Name"
          placeholder="e.g., Marketing Expert"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <Input
          label="Description"
          placeholder="Brief description of what this agent does"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value as AgentCategory)}
        />

        <TextArea
          label="System Prompt"
          placeholder="You are an expert..."
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          error={errors.systemPrompt}
          rows={6}
          className="font-mono text-sm"
        />

        {errors.submit && (
          <p className="text-sm text-accent-red">{errors.submit}</p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {editingAgentId ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
