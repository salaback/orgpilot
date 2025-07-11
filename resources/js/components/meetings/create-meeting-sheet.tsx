import { TextField } from '@/components/form/text-field';
import { SheetPanel } from '@/components/sheet-panel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
import type { Meeting } from '@/types';

interface MeetingSeries {
    id: number;
    title: string;
}

interface CreateMeetingSheetProps {
    isOpen: boolean;
    onClose: () => void;
    meetingSeries: MeetingSeries[];
    onSuccess?: (newMeeting?: Meeting) => void; // Updated to use Meeting type
    initialDateTime?: string;
}

interface MeetingFormData {
    title: string;
    meeting_series_id: string;
    meeting_time: string;
    notes: string;
    [key: string]: string;
}

export function CreateMeetingSheet({ isOpen, onClose, meetingSeries = [], onSuccess, initialDateTime }: CreateMeetingSheetProps) {
    const { data, setData, post, processing, errors, reset } = useForm<MeetingFormData>({
        title: '',
        meeting_series_id: '',
        meeting_time: initialDateTime || '',
        duration_minutes: '60', // Default to 60 minutes
        notes: '',
    });

    // Duration options in 15-minute increments
    const durationOptions = [
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '45', label: '45 minutes' },
        { value: '60', label: '1 hour' },
        { value: '75', label: '1 hour 15 minutes' },
        { value: '90', label: '1 hour 30 minutes' },
        { value: '105', label: '1 hour 45 minutes' },
        { value: '120', label: '2 hours' },
        { value: '150', label: '2 hours 30 minutes' },
        { value: '180', label: '3 hours' },
        { value: '240', label: '4 hours' },
    ];

    // Update the meeting_time if initialDateTime changes and the form hasn't been modified yet
    useEffect(() => {
        if (initialDateTime && isOpen) {
            setData('meeting_time', initialDateTime);
        }
    }, [initialDateTime, isOpen, setData]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('meetings.store'), {
            preserveScroll: true, // Preserve scroll position
            preserveState: true, // Preserve component state
            only: [], // Don't update any components
            onSuccess: (page: unknown) => {
                // Extract the newly created meeting from the response
                const newMeeting = (page as { props?: { flash?: { meeting?: Meeting } } })?.props?.flash?.meeting;

                // Reset the form
                reset();
                onClose();

                // Call the onSuccess callback with the new meeting data
                if (onSuccess) {
                    onSuccess(newMeeting);
                }
            },
        });
    }

    return (
        <SheetPanel
            open={isOpen}
            onClose={onClose}
            title="Create New Meeting"
            description="Schedule a new meeting with your team members."
            footer={
                <div className="flex w-full justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing} form="create-meeting-form">
                        {processing ? 'Creating...' : 'Create Meeting'}
                    </Button>
                </div>
            }
        >
            <form id="create-meeting-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <TextField
                        id="title"
                        label="Meeting Title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Weekly Team Standup"
                        error={errors.title}
                    />

                    <div>
                        <Label htmlFor="meeting_series_id">Meeting Series (Optional)</Label>
                        <Select value={data.meeting_series_id} onValueChange={(value) => setData('meeting_series_id', value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a meeting series" />
                            </SelectTrigger>
                            <SelectContent>
                                {meetingSeries.map((series) => (
                                    <SelectItem key={series.id} value={series.id.toString()}>
                                        {series.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.meeting_series_id && <p className="mt-1 text-sm text-red-600">{errors.meeting_series_id}</p>}
                    </div>

                    <TextField
                        id="meeting_time"
                        label="Meeting Date & Time"
                        type="datetime-local"
                        value={data.meeting_time}
                        onChange={(e) => setData('meeting_time', e.target.value)}
                        error={errors.meeting_time}
                    />

                    <div>
                        <Label htmlFor="duration_minutes">Meeting Duration</Label>
                        <Select value={data.duration_minutes} onValueChange={(value) => setData('duration_minutes', value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select meeting duration" />
                            </SelectTrigger>
                            <SelectContent>
                                {durationOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.duration_minutes && <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>}
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="mt-1"
                            rows={4}
                            placeholder="Add any notes or agenda items for this meeting..."
                        />
                        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                    </div>
                </div>
            </form>
        </SheetPanel>
    );
}
