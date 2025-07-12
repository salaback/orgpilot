import { TextField } from '@/components/form/text-field';
import { SheetPanel } from '@/components/sheet-panel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import React from 'react';

interface CreateMeetingSeriesSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface MeetingSeriesFormData {
    title: string;
    description: string;
    [key: string]: string;
}

export function CreateMeetingSeriesSheet({ isOpen, onClose, onSuccess }: CreateMeetingSeriesSheetProps) {
    const { data, setData, post, processing, errors, reset } = useForm<MeetingSeriesFormData>({
        title: '',
        description: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('meeting-series.store'), {
            onSuccess: () => {
                reset();
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            },
        });
    }

    return (
        <SheetPanel
            open={isOpen}
            onClose={onClose}
            title="Create New Meeting Series"
            description="Create a series of recurring meetings for your team."
            footer={
                <div className="flex w-full justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing} form="create-meeting-series-form">
                        {processing ? 'Creating...' : 'Create Meeting Series'}
                    </Button>
                </div>
            }
        >
            <form id="create-meeting-series-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <TextField
                        id="title"
                        label="Series Title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Weekly Team Standup"
                        error={errors.title}
                        required
                    />

                    <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1"
                            rows={4}
                            placeholder="Describe the purpose and goals of this meeting series..."
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>
                </div>
            </form>
        </SheetPanel>
    );
}
