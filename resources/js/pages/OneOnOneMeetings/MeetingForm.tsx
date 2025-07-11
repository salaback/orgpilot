import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { addDays, format } from 'date-fns';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React, { useState } from 'react';

interface Owner {
    id: number;
    name: string;
}

interface ActionItem {
    id?: number;
    description: string;
    owner_id: number;
    due_date: string | null;
    completed: boolean;
}

interface Goal {
    id: number;
    title: string;
    status: string;
    selected?: boolean;
}

interface Initiative {
    id: number;
    title: string;
    status: string;
    selected?: boolean;
}

interface MeetingFormProps {
    orgNode: {
        id: number;
        first_name: string;
        last_name: string;
        title: string;
        email: string;
        photo_url?: string;
    };
    meeting?: {
        id: number;
        scheduled_at: string;
        location: string;
        agenda: string;
        private_notes: string;
        shared_notes: string;
        action_items: ActionItem[];
    };
    incompleteActionItems?: ActionItem[];
    availableOwners: Owner[];
    availableGoals: Goal[];
    availableInitiatives: Initiative[];
    isEditing: boolean;
}

const MeetingForm: React.FC<MeetingFormProps> = ({
    orgNode,
    meeting,
    incompleteActionItems = [],
    availableOwners,
    availableGoals = [],
    availableInitiatives = [],
    isEditing,
}) => {
    const [selectedGoals, setSelectedGoals] = useState<number[]>(meeting?.goals?.map((goal) => goal.id) || []);

    const [selectedInitiatives, setSelectedInitiatives] = useState<number[]>(meeting?.initiatives?.map((initiative) => initiative.id) || []);

    // Initialize form with default values or meeting data if editing
    const form = useForm({
        scheduled_date: meeting ? format(new Date(meeting.scheduled_at), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        scheduled_time: meeting ? format(new Date(meeting.scheduled_at), 'HH:mm') : '09:00',
        location: meeting?.location || '',
        agenda: meeting?.agenda || '',
        private_notes: meeting?.private_notes || '',
        shared_notes: meeting?.shared_notes || '',
        action_items: meeting?.action_items || [],
        goals: selectedGoals,
        initiatives: selectedInitiatives,
    });

    const [includePreviousActionItems, setIncludePreviousActionItems] = useState(false);

    // Add a new empty action item
    const addActionItem = () => {
        const newActionItems = [
            ...form.data.action_items,
            {
                description: '',
                owner_id: availableOwners[0]?.id || 0,
                due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
                completed: false,
            },
        ];

        form.setData('action_items', newActionItems);
    };

    // Remove an action item at a specific index
    const removeActionItem = (index: number) => {
        const newActionItems = [...form.data.action_items];
        newActionItems.splice(index, 1);
        form.setData('action_items', newActionItems);
    };

    // Update an action item at a specific index
    const updateActionItem = (index: number, key: keyof ActionItem, value: string | number | boolean | undefined) => {
        const newActionItems = [...form.data.action_items];
        newActionItems[index] = {
            ...newActionItems[index],
            [key]: value,
        };
        form.setData('action_items', newActionItems);
    };

    // Toggle goal selection
    const toggleGoal = (goalId: number) => {
        if (selectedGoals.includes(goalId)) {
            setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
        } else {
            setSelectedGoals([...selectedGoals, goalId]);
        }

        // Update form data as well
        if (selectedGoals.includes(goalId)) {
            form.setData(
                'goals',
                form.data.goals.filter((id) => id !== goalId),
            );
        } else {
            form.setData('goals', [...form.data.goals, goalId]);
        }
    };

    // Toggle initiative selection
    const toggleInitiative = (initiativeId: number) => {
        if (selectedInitiatives.includes(initiativeId)) {
            setSelectedInitiatives(selectedInitiatives.filter((id) => id !== initiativeId));
        } else {
            setSelectedInitiatives([...selectedInitiatives, initiativeId]);
        }

        // Update form data as well
        if (selectedInitiatives.includes(initiativeId)) {
            form.setData(
                'initiatives',
                form.data.initiatives.filter((id) => id !== initiativeId),
            );
        } else {
            form.setData('initiatives', [...form.data.initiatives, initiativeId]);
        }
    };

    // Include incomplete action items from previous meetings
    const includeIncompleteActionItems = () => {
        if (includePreviousActionItems && incompleteActionItems.length > 0) {
            const currentActionItems = [...form.data.action_items];
            const incompleteItems = incompleteActionItems.filter((item) => !currentActionItems.some((current) => current.id === item.id));

            form.setData('action_items', [...currentActionItems, ...incompleteItems]);
            setIncludePreviousActionItems(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const url = isEditing ? `/organisation/profile/${orgNode.id}/one-on-one/${meeting?.id}` : `/organisation/profile/${orgNode.id}/one-on-one`;

        const method = isEditing ? 'put' : 'post';

        form[method](url);
    };

    return (
        <AppLayout>
            <Head title={isEditing ? `Edit 1:1 Meeting with ${orgNode.first_name}` : `New 1:1 Meeting with ${orgNode.first_name}`} />

            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="mb-8 flex items-center">
                    <Link
                        href={
                            isEditing
                                ? `/organisation/profile/${orgNode.id}/one-on-one/${meeting?.id}`
                                : `/organisation/profile/${orgNode.id}/one-on-one`
                        }
                        className="mr-3"
                    >
                        <Button variant="ghost" size="sm">
                            <ArrowLeftIcon className="mr-1 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {isEditing ? `Edit 1:1 Meeting with ${orgNode.first_name}` : `New 1:1 Meeting with ${orgNode.first_name}`}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Meeting Details */}
                            <Card className="shadow-sm">
                                <CardHeader className="px-6 pt-6">
                                    <CardTitle>Meeting Details</CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="scheduled_date">Date</Label>
                                            <div className="flex items-center">
                                                <Input
                                                    id="scheduled_date"
                                                    type="date"
                                                    value={form.data.scheduled_date}
                                                    onChange={(e) => form.setData('scheduled_date', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                            {form.errors.scheduled_date && <p className="text-sm text-red-500">{form.errors.scheduled_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="scheduled_time">Time</Label>
                                            <div className="flex items-center">
                                                <Input
                                                    id="scheduled_time"
                                                    type="time"
                                                    value={form.data.scheduled_time}
                                                    onChange={(e) => form.setData('scheduled_time', e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                            {form.errors.scheduled_time && <p className="text-sm text-red-500">{form.errors.scheduled_time}</p>}
                                        </div>
                                    </div>

                                    <div className="mb-6 space-y-2">
                                        <Label htmlFor="location">Location / Meeting Link</Label>
                                        <Input
                                            id="location"
                                            value={form.data.location}
                                            onChange={(e) => form.setData('location', e.target.value)}
                                            placeholder="Office Room 3 or Zoom/Teams URL"
                                        />
                                        {form.errors.location && <p className="text-sm text-red-500">{form.errors.location}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Agenda */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Agenda</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        id="agenda"
                                        placeholder="Enter meeting agenda items..."
                                        value={form.data.agenda}
                                        onChange={(e) => form.setData('agenda', e.target.value)}
                                        rows={5}
                                    />
                                    {form.errors.agenda && <p className="mt-1 text-sm text-red-500">{form.errors.agenda}</p>}
                                </CardContent>
                            </Card>

                            {/* Shared Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Shared Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        id="shared_notes"
                                        placeholder="These notes will be visible to both you and the direct report..."
                                        value={form.data.shared_notes}
                                        onChange={(e) => form.setData('shared_notes', e.target.value)}
                                        rows={4}
                                    />
                                    {form.errors.shared_notes && <p className="mt-1 text-sm text-red-500">{form.errors.shared_notes}</p>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Private Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Private Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        id="private_notes"
                                        placeholder="These notes are only visible to you..."
                                        value={form.data.private_notes}
                                        onChange={(e) => form.setData('private_notes', e.target.value)}
                                        rows={4}
                                    />
                                    {form.errors.private_notes && <p className="mt-1 text-sm text-red-500">{form.errors.private_notes}</p>}
                                </CardContent>
                            </Card>

                            {/* Action Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Action Items</span>
                                        <Button type="button" size="sm" variant="outline" onClick={addActionItem}>
                                            <PlusIcon className="mr-1 h-4 w-4" /> Add Item
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {incompleteActionItems.length > 0 && !includePreviousActionItems && (
                                        <div className="mb-4 rounded-md bg-blue-50 p-3">
                                            <div className="flex items-start">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-blue-700">
                                                        There {incompleteActionItems.length === 1 ? 'is' : 'are'} {incompleteActionItems.length}{' '}
                                                        incomplete action {incompleteActionItems.length === 1 ? 'item' : 'items'} from previous
                                                        meetings.
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="link"
                                                        className="h-auto p-0 text-blue-700"
                                                        onClick={() => {
                                                            setIncludePreviousActionItems(true);
                                                            includeIncompleteActionItems();
                                                        }}
                                                    >
                                                        Include in this meeting
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.data.action_items.length > 0 ? (
                                        <ul className="space-y-4">
                                            {form.data.action_items.map((item, index) => (
                                                <li key={index} className="rounded-md border p-3">
                                                    <div className="space-y-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <Input
                                                                    placeholder="Action item description"
                                                                    value={item.description}
                                                                    onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-500"
                                                                onClick={() => removeActionItem(index)}
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="text-xs">Owner</Label>
                                                                <Select
                                                                    value={item.owner_id.toString()}
                                                                    onValueChange={(value) => updateActionItem(index, 'owner_id', parseInt(value))}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select owner" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {availableOwners.map((owner) => (
                                                                            <SelectItem key={owner.id} value={owner.id.toString()}>
                                                                                {owner.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div>
                                                                <Label className="text-xs">Due Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={item.due_date || ''}
                                                                    onChange={(e) => updateActionItem(index, 'due_date', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Checkbox
                                                                id={`completed-${index}`}
                                                                checked={item.completed}
                                                                onCheckedChange={(checked) => updateActionItem(index, 'completed', !!checked)}
                                                            />
                                                            <Label htmlFor={`completed-${index}`} className="ml-2 text-sm">
                                                                Completed
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="py-6 text-center">
                                            <p className="text-sm text-gray-500">No action items added yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Linked Goals */}
                            {availableGoals.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Link Goals</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {availableGoals.map((goal) => (
                                                <li key={goal.id} className="flex items-center">
                                                    <Checkbox
                                                        id={`goal-${goal.id}`}
                                                        checked={selectedGoals.includes(goal.id)}
                                                        onCheckedChange={() => toggleGoal(goal.id)}
                                                    />
                                                    <Label htmlFor={`goal-${goal.id}`} className="ml-2 flex-1 text-sm">
                                                        {goal.title}
                                                        <span className="ml-2 text-xs text-gray-500">({goal.status})</span>
                                                    </Label>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Linked Initiatives */}
                            {availableInitiatives.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Link Initiatives</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {availableInitiatives.map((initiative) => (
                                                <li key={initiative.id} className="flex items-center">
                                                    <Checkbox
                                                        id={`initiative-${initiative.id}`}
                                                        checked={selectedInitiatives.includes(initiative.id)}
                                                        onCheckedChange={() => toggleInitiative(initiative.id)}
                                                    />
                                                    <Label htmlFor={`initiative-${initiative.id}`} className="ml-2 flex-1 text-sm">
                                                        {initiative.title}
                                                        <span className="ml-2 text-xs text-gray-500">({initiative.status})</span>
                                                    </Label>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Form Controls */}
                            <div className="flex justify-end gap-3">
                                <Link href={`/organisation/profile/${orgNode.id}/one-on-one`}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Saving...' : isEditing ? 'Update Meeting' : 'Create Meeting'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default MeetingForm;
