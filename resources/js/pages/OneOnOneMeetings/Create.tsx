import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon } from 'lucide-react';
import React from 'react';

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
        meeting_time: '',
        location: '',
        agenda: '',
        status: 'scheduled',
        duration_minutes: 30, // Default duration
        goals: [] as number[],
        initiatives: [] as number[],
    });

    // Helper to generate duration options in 15-minute increments (15 to 180 min)
    const getDurationOptions = () => {
        const options = [];
        for (let min = 15; min <= 180; min += 15) {
            options.push(min);
        }
        return options;
    };

    // Helper to round a date to the next 15-minute increment
    function roundToNext15(dt: Date) {
        const ms = 1000 * 60 * 15;
        return new Date(Math.ceil(dt.getTime() / ms) * ms);
    }

    // Helper to format date to yyyy-MM-ddTHH:mm for datetime-local input
    function formatDateTime(dt: Date) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    }

    // Set default value to next 15-min increment if empty
    React.useEffect(() => {
        if (!data.meeting_time) {
            const now = new Date();
            const rounded = roundToNext15(now);
            setData('meeting_time', formatDateTime(rounded));
        }
    }, [data.meeting_time, setData]);

    // Enforce 15-min increments on change
    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow times that are multiples of 15 minutes
        const dt = new Date(value);
        if (dt.getMinutes() % 15 !== 0) {
            dt.setMinutes(Math.ceil(dt.getMinutes() / 15) * 15);
            setData('meeting_time', formatDateTime(dt));
        } else {
            setData('meeting_time', value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/organisation/profile/${directReport.id}/one-on-one`);
    };

    const handleGoalChange = (goalId: number, checked: boolean) => {
        if (checked) {
            setData('goals', [...data.goals, goalId]);
        } else {
            setData(
                'goals',
                data.goals.filter((id) => id !== goalId),
            );
        }
    };

    const handleInitiativeChange = (initiativeId: number, checked: boolean) => {
        if (checked) {
            setData('initiatives', [...data.initiatives, initiativeId]);
        } else {
            setData(
                'initiatives',
                data.initiatives.filter((id) => id !== initiativeId),
            );
        }
    };

    return (
        <AppLayout>
            <Head title={`Schedule 1:1 Meeting with ${directReport.full_name}`} />

            <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="mb-4 flex items-center">
                        <Button asChild variant="ghost" size="sm" className="mr-4">
                            <a href={`/organisation/profile/${directReport.id}/one-on-one`}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Meetings
                            </a>
                        </Button>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Schedule 1:1 Meeting</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        with {directReport.full_name} ({directReport.title})
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                                    <Label htmlFor="meeting_time">Date & Time *</Label>
                                    <Input
                                        id="meeting_time"
                                        type="datetime-local"
                                        value={data.meeting_time}
                                        onChange={handleDateTimeChange}
                                        step={900} // 15 min in seconds
                                        required
                                    />
                                    {errors.meeting_time && <p className="mt-1 text-sm text-red-500">{errors.meeting_time}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="duration_minutes">Duration *</Label>
                                    <select
                                        id="duration_minutes"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', Number(e.target.value))}
                                        className="w-full rounded border px-2 py-1"
                                        required
                                    >
                                        {getDurationOptions().map((min) => (
                                            <option key={min} value={min}>
                                                {min} minutes
                                            </option>
                                        ))}
                                    </select>
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
                                    {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
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
                                    {errors.agenda && <p className="mt-1 text-sm text-red-500">{errors.agenda}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full rounded border px-2 py-1"
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
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
                                        <div className="max-h-64 space-y-3 overflow-y-auto">
                                            {goals.map((goal) => (
                                                <div key={goal.id} className="flex items-start space-x-3">
                                                    <Checkbox
                                                        id={`goal-${goal.id}`}
                                                        checked={data.goals.includes(goal.id)}
                                                        onCheckedChange={(checked) => handleGoalChange(goal.id, checked as boolean)}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <Label htmlFor={`goal-${goal.id}`} className="cursor-pointer text-sm font-medium">
                                                            {goal.title}
                                                        </Label>
                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {goal.status} • Due:{' '}
                                                            {goal.due_date ? new Date(goal.due_date).toLocaleDateString() : 'No due date'}
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
                                        <div className="max-h-64 space-y-3 overflow-y-auto">
                                            {initiatives.map((initiative) => (
                                                <div key={initiative.id} className="flex items-start space-x-3">
                                                    <Checkbox
                                                        id={`initiative-${initiative.id}`}
                                                        checked={data.initiatives.includes(initiative.id)}
                                                        onCheckedChange={(checked) => handleInitiativeChange(initiative.id, checked as boolean)}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <Label htmlFor={`initiative-${initiative.id}`} className="cursor-pointer text-sm font-medium">
                                                            {initiative.title}
                                                        </Label>
                                                        <p className="text-xs text-gray-500 capitalize">{initiative.status}</p>
                                                        {initiative.description && (
                                                            <p className="mt-1 line-clamp-2 text-xs text-gray-400">{initiative.description}</p>
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
                                    <CardContent className="py-8 text-center">
                                        <p className="text-gray-500">No active goals or initiatives found for {directReport.first_name}.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <Button asChild variant="outline">
                            <a href={`/organisation/profile/${directReport.id}/one-on-one`}>Cancel</a>
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
