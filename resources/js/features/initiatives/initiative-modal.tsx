import React, { useState, useEffect } from 'react';
import { Initiative, InitiativeStatus } from './types';
import { SheetPanel } from '@/components/SheetPanel';
import { TextField } from '@/components/form/TextField';
import { SelectField } from '@/components/form/SelectField';
import { MultiSelectField } from '@/components/form/MultiSelectField';
import { Button } from '@/components/ui/button';
import { useTagOptions } from './useTagOptions';
import type { MultiSelectOption } from '@/components/form/MultiSelectField';

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
}

interface User {
  id: number;
  name: string;
}

interface InitiativeModalProps {
  open: boolean;
  onClose: () => void;
  initiative?: Initiative;
  users: OrgNode[];
  onSave: (initiative: Initiative) => void;
}

const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

const normalizeInitiative = (data: any): Initiative => ({
  ...data,
  dueDate: data.dueDate || data.due_date || '',
});

const InitiativeModal: React.FC<InitiativeModalProps> = ({ open, onClose, initiative, users, onSave }) => {
  const { options: tagOptions, createTag } = useTagOptions();
  const [form, setForm] = useState<Initiative>(
    initiative ? normalizeInitiative(initiative) : {
      id: Date.now(),
      title: '',
      description: '',
      status: 'planned',
      tags: [],
      dueDate: undefined,
      assignees: [],
      teamLabel: '',
      allocations: [],
    }
  );

  useEffect(() => {
    if (open) {
      setForm(
        initiative ? normalizeInitiative(initiative) : {
          id: Date.now(),
          title: '',
          description: '',
          status: 'planned',
          tags: [],
          dueDate: undefined,
          assignees: [],
          teamLabel: '',
          allocations: [],
        }
      );
    }
  }, [open, initiative]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, status: e.target.value as InitiativeStatus });
  };
  const handleAssigneesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
    setForm({ ...form, assignees: selected });
  };
  const handleTagIdsChange = (ids: string[]) => {
    setForm({ ...form, tags: ids });
  };
  // Ensure tagOptions is always up to date when a new tag is created and selected
  const handleCreateTag = async (name: string) => {
    const newTag = await createTag(name);
    if (newTag) {
      setForm(f => {
        // Defensive: ensure tags is an array of strings
        const tagId = newTag.value;
        let tags = Array.isArray(f.tags) ? f.tags.map(String) : [];
        if (!tags.includes(tagId)) {
          tags = [...tags, tagId];
        }
        return { ...f, tags };
      });
    }
  };
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <SheetPanel
      open={open}
      onClose={onClose}
      title={initiative ? 'Edit Initiative' : 'New Initiative'}
      description={initiative ? 'Edit the details of this initiative.' : 'Create a new initiative for your team.'}
      footer={
        <div className="flex justify-end space-x-2 w-full">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="initiative-form">Save</Button>
        </div>
      }
    >
      <form id="initiative-form" onSubmit={handleSave} className="space-y-6">
        <div className="space-y-5">
          <TextField
            id="title"
            name="title"
            label="Title"
            value={form.title}
            onChange={e => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
            placeholder="Initiative title"
          />
          <div>
            <label>Description<br />
              <textarea name="description" value={form.description} onChange={handleChange} style={{ width: '100%' }} rows={3} />
            </label>
          </div>
          <SelectField
            id="status"
            label="Status"
            value={form.status}
            onChange={val => handleStatusChange({ target: { value: val } } as any)}
            options={statusOptions}
          />
          <MultiSelectField
            id="assignees"
            label="Assignees"
            values={form.assignees.map(String)}
            onChange={vals => setForm({ ...form, assignees: vals.map(Number) })}
            options={users.map(u => ({ value: String(u.id), label: u.first_name + ' ' + u.last_name }))}
            placeholder="Select people from your org"
          />
          <MultiSelectField
            id="tags"
            label="Tags"
            values={form.tags as string[]}
            onChange={handleTagIdsChange}
            options={tagOptions as MultiSelectOption[]}
            placeholder="Add or create tags"
            onCreateOption={handleCreateTag}
          />
          <TextField
            id="dueDate"
            label="Due Date"
            value={form.dueDate || ''}
            onChange={e => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
            type="date"
          />
        </div>
      </form>
    </SheetPanel>
  );
};

export default InitiativeModal;
