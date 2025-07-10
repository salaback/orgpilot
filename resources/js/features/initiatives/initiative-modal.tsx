import React, { useState, useEffect } from 'react';
import { Initiative, InitiativeStatus } from './types';
import { SheetPanel } from '@/components/sheet-panel';
import { TextField } from '@/components/form/text-field';
import { SelectField } from '@/components/form/select-field';
import { MultiSelectField } from '@/components/form/multi-select-field';
import { Button } from '@/components/ui/button';
import { useTagOptions } from './useTagOptions';
import type { MultiSelectOption } from '@/components/form/multi-select-field';

interface Employee {
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
  assignees: Employee[];
  onSave: (initiative: Initiative) => void;
}

const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

const normalizeInitiative = (data: any): Initiative => {
  // Convert tag objects to string IDs for the form
  let tags: (string | number)[] = [];
  if (Array.isArray(data.tags)) {
    tags = data.tags.map((tag: any) => {
      if (typeof tag === 'object' && tag.id) {
        return String(tag.id);
      }
      return String(tag);
    });
  }

  return {
    ...data,
    dueDate: data.dueDate || data.due_date || '',
    tags: tags,
  };
};

const InitiativeModal: React.FC<InitiativeModalProps> = ({ open, onClose, initiative, assignees, onSave }) => {
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
            options={assignees.map(u => ({ value: String(u.id), label: u.first_name + ' ' + u.last_name }))}
            placeholder="Select people from your org"
            onCreateOption={handleCreateTag}
          />
          <MultiSelectField
            id="tags"
            label="Tags"
            values={form.tags as string[]}
            onChange={handleTagIdsChange}
            options={Array.isArray(tagOptions) ? tagOptions : []}
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
