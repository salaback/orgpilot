import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrgNode } from '@/types';

interface AddDirectReportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  managerId: number;
  onSuccess?: (managerId: number) => void; // New callback for success
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
    post(route('organization.direct-report.store'), {
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle>Add Direct Report</SheetTitle>
          <SheetDescription>
            Add a new team member or placeholder position to your organization chart.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={data.first_name}
                  onChange={(e) => setData('first_name', e.target.value)}
                  placeholder="Jane"
                  className="mt-2"
                />
                {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={data.last_name}
                  onChange={(e) => setData('last_name', e.target.value)}
                  placeholder="Doe"
                  className="mt-2"
                />
                {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Engineering Manager"
                className="mt-2"
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="jane.doe@example.com"
                className="mt-2"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

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

          <SheetFooter className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-2 w-full">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={processing}>Add Direct Report</Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
