import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import React, { useState } from 'react';

interface Owner {
    id: number;
    name: string;
}

interface ActionItem {
    id: number;
    description: string;
    owner: Owner;
    due_date: string | null;
    completed: boolean;
}

interface Goal {
    id: number;
    title: string;
    description: string;
    status: string;
}

interface Initiative {
    id: number;
    title: string;
    status: string;
}

interface Meeting {
    id: number;
    scheduled_at: string;
    completed_at: string | null;
    status: 'scheduled' | 'completed' | 'cancelled';
    agenda: string;
    private_notes: string;
    shared_notes: string;
    summary: string;
    location: string;
    action_items: ActionItem[];
    goals: Goal[];
    initiatives: Initiative[];
}

interface MeetingDetailProps {
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
        title: string;
        email: string;
        status: string;
    };
    meeting: Meeting;
    currentUser: {
        id: number;
        name: string;
    };
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({ employee, meeting }) => {
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const completeForm = useForm({
        summary: meeting.summary || '',
    });

    const cancelForm = useForm({
        cancellation_reason: '',
    });

    const handleCompleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        completeForm.post(`/organisation/profile/${employee.id}/one-on-one/${meeting.id}/complete`, {
            onSuccess: () => setIsCompleteDialogOpen(false),
        });
    };

    const handleCancelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        cancelForm.post(`/organisation/profile/${employee.id}/one-on-one/${meeting.id}/cancel`, {
            onSuccess: () => setIsCancelDialogOpen(false),
        });
    };

    const handleActionItemToggle = () => {
        // This would typically make an API call to update the action item status
    };

    const isMeetingActive = meeting.status === 'scheduled';
    const isCompletable = isMeetingActive && new Date(meeting.scheduled_at) <= new Date();

    return (
        <AppLayout>
            <Head title={`1:1 Meeting with ${employee.first_name}`} />

            <div className="container py-6">
                <div className="mb-6 flex items-center">
                    <Link href={`/organisation/profile/${employee.id}/one-on-one`} className="mr-3">
                        <Button variant="ghost" size="sm">
                            <ArrowLeftIcon className="mr-1 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        1:1 Meeting with {employee.first_name} {employee.last_name}
                    </h1>
                </div>

                {/* Meeting Header */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-start justify-between">
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{format(new Date(meeting.scheduled_at), 'EEEE, MMMM d, yyyy')}</span>
                                </div>
                                <div className="mb-1 flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 text-gray-500" />
                                    <span>{format(new Date(meeting.scheduled_at), 'h:mm a')}</span>
                                </div>
                                {meeting.location && (
                                    <div className="mb-1 flex items-center gap-2">
                                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                                        <span>{meeting.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-2 flex items-center sm:mt-0">
                                <Badge
                                    variant={meeting.status === 'completed' ? 'success' : meeting.status === 'cancelled' ? 'destructive' : 'default'}
                                    className="text-xs"
                                >
                                    {meeting.status === 'completed' ? 'Completed' : meeting.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
                                </Badge>

                                {isMeetingActive && (
                                    <div className="ml-4 flex gap-2">
                                        <Link href={`/organisation/profile/${employee.id}/one-on-one/${meeting.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </Link>
                                        {isCompletable && (
                                            <Button size="sm" onClick={() => setIsCompleteDialogOpen(true)}>
                                                Mark as Complete
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-500 hover:bg-red-50"
                                            onClick={() => setIsCancelDialogOpen(true)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Agenda */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Agenda</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {meeting.agenda ? (
                                    <div className="whitespace-pre-wrap">{meeting.agenda}</div>
                                ) : (
                                    <p className="text-gray-500 italic">No agenda was set for this meeting.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Shared Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shared Notes</CardTitle>
                                <CardDescription>Notes visible to both manager and direct report</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {meeting.shared_notes ? (
                                    <div className="whitespace-pre-wrap">{meeting.shared_notes}</div>
                                ) : (
                                    <p className="text-gray-500 italic">No shared notes were recorded.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary & Next Steps */}
                        {meeting.status === 'completed' && meeting.summary && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Summary & Next Steps</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="whitespace-pre-wrap">{meeting.summary}</div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Private Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Private Notes</CardTitle>
                                <CardDescription>Only visible to you</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {meeting.private_notes ? (
                                    <div className="whitespace-pre-wrap">{meeting.private_notes}</div>
                                ) : (
                                    <p className="text-gray-500 italic">No private notes were recorded.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Items */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Action Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {meeting.action_items && meeting.action_items.length > 0 ? (
                                    <ul className="space-y-3">
                                        {meeting.action_items.map((item) => (
                                            <li key={item.id} className="flex items-start gap-3">
                                                <Checkbox
                                                    id={`action-item-${item.id}`}
                                                    checked={item.completed}
                                                    onCheckedChange={() => handleActionItemToggle()}
                                                    disabled={meeting.status !== 'scheduled'}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={`action-item-${item.id}`}
                                                        className={`block text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                                                    >
                                                        {item.description}
                                                    </label>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        <span className="mr-3 inline-block">Owner: {item.owner.name}</span>
                                                        {item.due_date && <span>Due: {format(new Date(item.due_date), 'MMM d, yyyy')}</span>}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">No action items were created.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Linked Goals */}
                        {meeting.goals && meeting.goals.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Linked Goals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {meeting.goals.map((goal) => (
                                            <li key={goal.id}>
                                                <p className="font-medium">{goal.title}</p>
                                                <p className="text-sm text-gray-600">{goal.status}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Linked Initiatives */}
                        {meeting.initiatives && meeting.initiatives.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Linked Initiatives</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {meeting.initiatives.map((initiative) => (
                                            <li key={initiative.id}>
                                                <p className="font-medium">{initiative.title}</p>
                                                <p className="text-sm text-gray-600">{initiative.status}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Complete Meeting Dialog */}
            <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete 1:1 Meeting</DialogTitle>
                        <DialogDescription>Summarize the key points and next steps from this meeting.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCompleteSubmit}>
                        <div className="space-y-4 py-4">
                            <div>
                                <label htmlFor="summary" className="text-sm font-medium">
                                    Meeting Summary
                                </label>
                                <Textarea
                                    id="summary"
                                    placeholder="Enter a summary of what was discussed and any next steps..."
                                    value={completeForm.data.summary}
                                    onChange={(e) => completeForm.setData('summary', e.target.value)}
                                    className="mt-1"
                                    rows={5}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={completeForm.processing}>
                                {completeForm.processing ? 'Saving...' : 'Complete Meeting'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Cancel Meeting Dialog */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel 1:1 Meeting</DialogTitle>
                        <DialogDescription>Are you sure you want to cancel this meeting?</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCancelSubmit}>
                        <div className="space-y-4 py-4">
                            <div>
                                <label htmlFor="cancellation_reason" className="text-sm font-medium">
                                    Reason for Cancellation (Optional)
                                </label>
                                <Textarea
                                    id="cancellation_reason"
                                    placeholder="Enter a reason for cancelling this meeting..."
                                    value={cancelForm.data.cancellation_reason}
                                    onChange={(e) => cancelForm.setData('cancellation_reason', e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                                Keep Meeting
                            </Button>
                            <Button type="submit" variant="destructive" disabled={cancelForm.processing}>
                                {cancelForm.processing ? 'Cancelling...' : 'Cancel Meeting'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default MeetingDetail;
