import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface Meeting {
    id: number;
    title: string;
    meeting_time: string;
    notes?: string;
    meeting_series_id?: number;
}

interface MeetingSeries {
    id: number;
    title: string;
}

interface Props {
    meeting: Meeting;
    meetingSeries: MeetingSeries[];
}

interface MeetingFormData {
    title: string;
    meeting_series_id: string;
    meeting_time: string;
    notes: string;
    [key: string]: string;
}

export default function EditMeeting({ meeting, meetingSeries = [] }: Props) {
    const { data, setData, put, processing, errors } = useForm<MeetingFormData>({
        title: meeting.title,
        meeting_series_id: meeting.meeting_series_id?.toString() || '',
        meeting_time: meeting.meeting_time,
        notes: meeting.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('meetings.update', meeting.id));
    };

    return (
        <AppLayout>
            <Head title="Edit Meeting" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h2 className="text-xl leading-tight font-semibold text-gray-800">Edit Meeting</h2>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Meeting Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="title">Meeting Title</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>

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

                                <div>
                                    <Label htmlFor="meeting_time">Meeting Date & Time</Label>
                                    <Input
                                        id="meeting_time"
                                        type="datetime-local"
                                        value={data.meeting_time}
                                        onChange={(e) => setData('meeting_time', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.meeting_time && <p className="mt-1 text-sm text-red-600">{errors.meeting_time}</p>}
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

                                <div className="flex justify-end space-x-3">
                                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Meeting'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
