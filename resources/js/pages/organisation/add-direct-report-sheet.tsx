import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { SheetPanel } from '@/components/sheet-panel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextField } from '@/components/form/text-field';
import { Label } from '@/components/ui/label';
import { Employee } from '@/types';

interface AddDirectReportSheetProps {
  manager: Employee;
  onSuccess: (managerId: number) => void;
  open: boolean;
  onClose: () => void;
}

export function AddDirectReportSheet({ isOpen, onClose, managerId, onSuccess }: AddDirectReportSheetProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: '',
    last_name: '',
    title: '',
    email: '',
    status: 'active',
    node_type: 'person',
    manager_id: managerId,
  });

  // Ensure manager_id is always updated when the prop changes
  useEffect(() => {
    if (managerId) {
      setData('manager_id', managerId);
    }
  }, [managerId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route('organisation.direct-report.store'), {
      onSuccess: () => {
        reset();
        onClose();
        // Trigger the onSuccess callback with the manager ID
        if (onSuccess) {
          onSuccess(managerId);
        }
      },
    });
  }

  return (
    <SheetPanel
      open={isOpen}
      onClose={onClose}
      title="Add Direct Report"
      description="Add a new team member or placeholder position to your organisation chart."
      footer={
        <div className="flex justify-end space-x-2 w-full">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={processing} form="add-direct-report-form">Add Direct Report</Button>
        </div>
      }
    >
      <form id="add-direct-report-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              id="first_name"
              label="First Name"
              value={data.first_name}
              onChange={e => setData('first_name', e.target.value)}
              placeholder="Jane"
              error={errors.first_name}
            />
            <TextField
              id="last_name"
              label="Last Name"
              value={data.last_name}
              onChange={e => setData('last_name', e.target.value)}
              placeholder="Doe"
              error={errors.last_name}
            />
          </div>
          <TextField
            id="title"
            label="Title"
            value={data.title}
            onChange={e => setData('title', e.target.value)}
            placeholder="Engineering Manager"
            error={errors.title}
          />
          <TextField
            id="email"
            label="Email (optional)"
            value={data.email}
            onChange={e => setData('email', e.target.value)}
            placeholder="jane.doe@example.com"
            error={errors.email}
            type="email"
          />

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={data.status}
              onValueChange={(value) => setData('status', value)}
            >
              <SelectTrigger id="status" className="mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="open">Open Position</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
          </div>

          <div>
            <Label htmlFor="node_type">Type</Label>
            <Select
              value={data.node_type}
              onValueChange={(value) => setData('node_type', value)}
            >
              <SelectTrigger id="node_type" className="mt-2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="placeholder">Placeholder</SelectItem>
              </SelectContent>
            </Select>
            {errors.node_type && <p className="text-sm text-red-500 mt-1">{errors.node_type}</p>}
          </div>
        </div>
      </form>
    </SheetPanel>
  );
}
