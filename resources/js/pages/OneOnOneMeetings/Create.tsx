import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, ArrowLeftIcon } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  status: string;
  due_date: string;
}

interface Initiative {
  id: number;
  title: string;
  status: string;
  description: string;
}

interface CreateProps {
  directReport: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    title: string;
  };
  goals: Goal[];
  initiatives: Initiative[];
}

const Create: React.FC<CreateProps> = ({ directReport, goals, initiatives }) => {
  const { data, setData, post, processing, errors } = useForm({
    scheduled_at: '',
    location: '',
    agenda: '',
    private_notes: '',
    shared_notes: '',
    goals: [] as number[],
    initiatives: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/organisation/profile/${directReport.id}/one-on-one`);
  };

  const handleGoalChange = (goalId: number, checked: boolean) => {
    if (checked) {
      setData('goals', [...data.goals, goalId]);
    } else {
      setData('goals', data.goals.filter(id => id !== goalId));
    }
  };

  const handleInitiativeChange = (initiativeId: number, checked: boolean) => {
    if (checked) {
      setData('initiatives', [...data.initiatives, initiativeId]);
    } else {
      setData('initiatives', data.initiatives.filter(id => id !== initiativeId));
    }
  };

  return (
    <AppLayout>
      <Head title={`Schedule 1:1 Meeting with ${directReport.full_name}`} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button asChild variant="ghost" size="sm" className="mr-4">
              <a href={`/organisation/profile/${directReport.id}/one-on-one`}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Meetings
              </a>
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Schedule 1:1 Meeting
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            with {directReport.full_name} ({directReport.title})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meeting Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Meeting Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scheduled_at">Date & Time *</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={data.scheduled_at}
                    onChange={(e) => setData('scheduled_at', e.target.value)}
                    className={errors.scheduled_at ? 'border-red-500' : ''}
                    required
                  />
                  {errors.scheduled_at && (
                    <p className="text-sm text-red-500 mt-1">{errors.scheduled_at}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Conference room, Zoom link, etc."
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500 mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="agenda">Agenda</Label>
                  <Textarea
                    id="agenda"
                    placeholder="Meeting agenda and topics to discuss..."
                    value={data.agenda}
                    onChange={(e) => setData('agenda', e.target.value)}
                    rows={4}
                    className={errors.agenda ? 'border-red-500' : ''}
                  />
                  {errors.agenda && (
                    <p className="text-sm text-red-500 mt-1">{errors.agenda}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="private_notes">Private Notes</Label>
                  <Textarea
                    id="private_notes"
                    placeholder="Notes for yourself (not shared with direct report)..."
                    value={data.private_notes}
                    onChange={(e) => setData('private_notes', e.target.value)}
                    rows={3}
                    className={errors.private_notes ? 'border-red-500' : ''}
                  />
                  {errors.private_notes && (
                    <p className="text-sm text-red-500 mt-1">{errors.private_notes}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shared_notes">Shared Notes</Label>
                  <Textarea
                    id="shared_notes"
                    placeholder="Notes shared with your direct report..."
                    value={data.shared_notes}
                    onChange={(e) => setData('shared_notes', e.target.value)}
                    rows={3}
                    className={errors.shared_notes ? 'border-red-500' : ''}
                  />
                  {errors.shared_notes && (
                    <p className="text-sm text-red-500 mt-1">{errors.shared_notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Items */}
            <div className="space-y-6">
              {/* Goals */}
              {goals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {goals.map(goal => (
                        <div key={goal.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={`goal-${goal.id}`}
                            checked={data.goals.includes(goal.id)}
                            onCheckedChange={(checked) => handleGoalChange(goal.id, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={`goal-${goal.id}`} className="text-sm font-medium cursor-pointer">
                              {goal.title}
                            </Label>
                            <p className="text-xs text-gray-500 capitalize">
                              {goal.status} • Due: {goal.due_date ? new Date(goal.due_date).toLocaleDateString() : 'No due date'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Initiatives */}
              {initiatives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Initiatives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {initiatives.map(initiative => (
                        <div key={initiative.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={`initiative-${initiative.id}`}
                            checked={data.initiatives.includes(initiative.id)}
                            onCheckedChange={(checked) => handleInitiativeChange(initiative.id, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={`initiative-${initiative.id}`} className="text-sm font-medium cursor-pointer">
                              {initiative.title}
                            </Label>
                            <p className="text-xs text-gray-500 capitalize">
                              {initiative.status}
                            </p>
                            {initiative.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {initiative.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {goals.length === 0 && initiatives.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No active goals or initiatives found for {directReport.first_name}.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button asChild variant="outline">
              <a href={`/organisation/profile/${directReport.id}/one-on-one`}>
                Cancel
              </a>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default Create;
