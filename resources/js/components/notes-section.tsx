import { Inertia } from '@inertiajs/inertia';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Note {
    id: number;
    title?: string;
    content: string;
    created_at: string;
    updated_at: string;
    tags?: Array<{ id: number; name: string }>;
    notable_type?: string; // The type of entity where the note was originally created
    notable_id?: number; // The ID of the entity where the note was originally created
}

interface NotesSectionProps {
    notes: Note[];
    entityType: string;
    entityId: number;
    entityUrl?: string; // Optional direct URL to the entity
    employees?: Array<{ id: number; first_name: string; last_name: string; email: string }>;
    onNotesUpdate?: (notes: Note[]) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes = [], entityType = 'item', entityId, entityUrl, employees = [] }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [detectedTags, setDetectedTags] = useState<string[]>([]);
    const [detectedMentions, setDetectedMentions] = useState<Array<{ id: number; name: string }>>([]);
    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
    const textareaRef = useRef<HTMLDivElement>(null);

    const HASHTAG_CLASS = 'text-indigo-600 dark:text-indigo-300 font-semibold mr-1';
    const MENTION_CLASS_VALID = 'text-green-600 dark:text-green-400 font-bold mr-1';
    const MENTION_CLASS_INVALID = 'text-gray-500 dark:text-gray-400 font-semibold mr-1';

    // Extract hashtags from content
    const extractHashtags = (text: string): string[] => {
        const hashtagRegex = /#([^\s\t]+)(?=\s|\t|$)/g;
        const matches = text.match(hashtagRegex);
        return matches ? matches.map((tag) => tag.substring(1)) : [];
    };

    // Extract mentions from content
    const extractMentions = (text: string): Array<{ id: number; name: string }> => {
        const mentionRegex = /@([^\s\t]+)/g;
        const mentions: Array<{ id: number; name: string }> = [];
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            const mentionName = match[1];
            // Find employee by name (case-insensitive)
            const employee = employees.find(
                (emp) => emp.first_name.toLowerCase() === mentionName.toLowerCase() || emp.last_name.toLowerCase() === mentionName.toLowerCase() || `${emp.first_name} ${emp.last_name}`.toLowerCase() === mentionName.toLowerCase(),
            );

            if (employee) {
                mentions.push({
                    id: employee.id,
                    name: `${employee.first_name} ${employee.last_name}`,
                });
            }
        }

        return mentions;
    };

    // Process content to replace hashtags and mentions with styled spans for display
    const processContentForDisplay = (content: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        const combinedRegex = /(#[^\s\t]+|@[^\s\t]+)(?=\s|\t|$)/g;
        let match;
        while ((match = combinedRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }
            if (match[1].startsWith('#')) {
                parts.push(
                    <span key={`tag-${match.index}`} className={HASHTAG_CLASS}>
                        {match[1]}
                    </span>,
                );
            } else if (match[1].startsWith('@')) {
                const mentionName = match[1].substring(1);
                const foundEmployee = employees.find(
                    (employee) =>
                        `${employee.first_name}${employee.last_name}`.toLowerCase().replace(/\s/g, '') === mentionName.toLowerCase() ||
                        `${employee.first_name}.${employee.last_name}`.toLowerCase() === mentionName.toLowerCase() ||
                        employee.first_name.toLowerCase() === mentionName.toLowerCase() ||
                        employee.last_name.toLowerCase() === mentionName.toLowerCase(),
                );
                parts.push(
                    <span key={`mention-${match.index}`} className={foundEmployee ? MENTION_CLASS_VALID : MENTION_CLASS_INVALID}>
                        {match[1]}
                    </span>,
                );
            }
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }
        return parts;
    };

    // Handle content change and tag detection for contenteditable div
    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget.textContent || '';
        setNewNote({ ...newNote, content: newContent });

        // Extract and update detected tags
        const tags = extractHashtags(newContent);
        setDetectedTags(tags);

        // Extract and update detected mentions
        const mentions = extractMentions(newContent);
        setDetectedMentions(mentions);

        // Check for active @ mention typing
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;

            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                const textContent = textNode.textContent || '';
                const cursorPosition = range.startOffset;

                // Look for @ symbol before cursor
                const textBeforeCursor = textContent.substring(0, cursorPosition);
                const lastAtIndex = textBeforeCursor.lastIndexOf('@');

                if (lastAtIndex !== -1) {
                    const mentionQuery = textBeforeCursor.substring(lastAtIndex + 1);

                    // Check if we have at least 2 characters after @ and no spaces
                    if (mentionQuery.length >= 2 && !mentionQuery.includes(' ') && !mentionQuery.includes('\t')) {
                        // const suggestions = getMentionSuggestions(mentionQuery);
                        // setMentionSuggestions(suggestions); // This line was removed as per the edit hint
                        // setCurrentMentionQuery(mentionQuery); // This line was removed as per the edit hint
                        setShowMentionSuggestions(true);
                    } else if (mentionQuery.length < 2) {
                        setShowMentionSuggestions(false);
                    }
                } else {
                    setShowMentionSuggestions(false);
                }
            }
        }
    };

    // Handle key events for contenteditable div
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Allow normal text editing behavior
        if (e.key === 'Enter' && e.shiftKey) {
            // Allow Shift+Enter for new lines
            return;
        }

        // Handle navigation through mention suggestions
        if (showMentionSuggestions) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                // TODO: Implement navigation through suggestions
            } else if (e.key === 'Enter') {
                e.preventDefault();
                // TODO: Implement selection of suggestion
            }
        }
    };

    // Process content to create HTML with inline bold hashtags and mentions
    const createInlineStyledContent = (content: string): string => {
        const hashtagRegex = /#([^\s\t]+)(?=\s|\t|$)/g;
        const mentionRegex = /@([^\s\t]+)(?=\s|\t|$)/g;

        // First replace hashtags
        let styledContent = content.replace(hashtagRegex, (match, tagName) => {
            return `<strong style="color: #667eea; font-weight: 600;">#${tagName}</strong>`;
        });

        // Then replace mentions
        styledContent = styledContent.replace(mentionRegex, (match, mentionName) => {
            return `<strong style="color: #28a745; font-weight: 600;">@${mentionName}</strong>`;
        });

        return styledContent;
    };

    // Effect to update contenteditable div content with bold hashtags and mentions
    useEffect(() => {
        if (textareaRef.current && newNote.content) {
            const selection = window.getSelection();
            const currentRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            const currentOffset = currentRange ? currentRange.startOffset : 0;
            const currentContainer = currentRange ? currentRange.startContainer : null;

            const styledContent = createInlineStyledContent(newNote.content);

            if (textareaRef.current.innerHTML !== styledContent) {
                textareaRef.current.innerHTML = styledContent;

                // Restore cursor position more carefully
                try {
                    if (selection && currentContainer) {
                        const newRange = document.createRange();
                        const walker = document.createTreeWalker(textareaRef.current, NodeFilter.SHOW_TEXT, null);

                        let currentPos = 0;
                        let targetNode = null;
                        let targetOffset = 0;

                        while (walker.nextNode()) {
                            const textNode = walker.currentNode;
                            const textLength = textNode.textContent?.length || 0;

                            if (currentPos + textLength >= currentOffset) {
                                targetNode = textNode;
                                targetOffset = currentOffset - currentPos;
                                break;
                            }
                            currentPos += textLength;
                        }

                        if (targetNode) {
                            newRange.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                        }
                    }
                } catch {
                    // Cursor positioning failed, place at end
                    if (selection && textareaRef.current.lastChild) {
                        const range = document.createRange();
                        range.selectNodeContents(textareaRef.current);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
        }
    }, [newNote.content]);

    const handleAddNote = async () => {
        if (!newNote.content.trim()) return;

        setIsSubmitting(true);

        try {
            // Extract tags from content before submitting
            const tags = extractHashtags(newNote.content);

            // Extract mention IDs (only numeric IDs, not full objects)
            const mentionIds = detectedMentions.map((mention) => mention.id);

            const routeName = entityType === 'meeting' ? 'meeting.notes.store' : `${entityType}.notes.store`;

            Inertia.post(
                route(routeName, entityId),
                {
                    title: newNote.title || null,
                    content: newNote.content,
                    tags: tags, // Send extracted tags
                    mentions: mentionIds, // Send only the numeric IDs
                },
                {
                    onSuccess: () => {
                        setNewNote({ title: '', content: '' });
                        setDetectedTags([]);
                        setDetectedMentions([]);
                        setIsAdding(false);
                        // No need to manually reload as Inertia handles this
                    },
                    onError: (errors) => {
                        console.error('Failed to create note:', errors);
                        alert('Failed to create note. Please try again.');
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error creating note:', error);
            setIsSubmitting(false);
        }
    };

    // Format date to show relative time (e.g., "2 days ago")
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffSecs = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffSecs / 60);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);

            if (diffSecs < 60) {
                return 'just now';
            } else if (diffMins < 60) {
                return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
            } else if (diffHours < 24) {
                return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
            } else if (diffDays < 30) {
                return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
            } else if (diffMonths < 12) {
                return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
            } else {
                return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
            }
        } catch {
            return dateString;
        }
    };

    // Generate entity URL based on type and ID if not provided directly
    const getEntityUrl = (): string => {
        if (entityUrl) return entityUrl;

        // Default URL patterns for common entity types
        switch (entityType.toLowerCase()) {
            case 'initiative':
                return `/initiatives/${entityId}`;
            case 'task':
                return `/tasks/${entityId}`;
            case 'goal':
                return `/goals/${entityId}`;
            default:
                return `#`;
        }
    };

    return (
        <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="m-0 text-lg font-medium text-gray-900 dark:text-gray-100">Notes ({notes.length})</h3>
                {!isAdding && (
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="rounded-md border-none bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        Add Note
                    </Button>
                )}
            </div>
            {/* Add New Note Form */}
            {isAdding && (
                <Card className="mb-4 rounded-lg border-2 border-blue-600 bg-white p-4 dark:border-blue-400 dark:bg-gray-800">
                    <div className="mb-3">
                        <Label htmlFor="note-title" className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200">
                            Title (optional)
                        </Label>
                        <Input
                            id="note-title"
                            type="text"
                            placeholder="Note title..."
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="note-content" className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200">
                            Content * <span className="text-xs text-gray-500 dark:text-gray-400">Use #hashtags to create tags</span>
                        </Label>
                        <div className="relative">
                            <div
                                ref={textareaRef}
                                contentEditable
                                onInput={handleContentChange}
                                onKeyDown={handleKeyDown}
                                className="content-editable-placeholder min-h-[100px] w-full resize-y overflow-auto rounded-md border border-gray-200 bg-white px-3 py-2 font-sans text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            />
                            {!newNote.content && (
                                <div className="pointer-events-none absolute top-2 left-3 z-10 text-sm text-gray-400 italic dark:text-gray-500">
                                    Write your note here... Use #hashtags to create tags automatically
                                </div>
                            )}
                        </div>
                        {(detectedTags.length > 0 || detectedMentions.length > 0) && (
                            <div className="mt-2">
                                {detectedTags.length > 0 && (
                                    <div className="mb-1">
                                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Detected tags:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {detectedTags.map((tag, index) => (
                                                <span
                                                    key={`preview-${index}`}
                                                    className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 text-xs font-medium text-white opacity-80"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {detectedMentions.length > 0 && (
                                    <div>
                                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Detected mentions:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {detectedMentions.map((mention, index) => (
                                                <span
                                                    key={`mention-preview-${index}`}
                                                    className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white opacity-80"
                                                >
                                                    {mention.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleAddNote}
                            disabled={isSubmitting}
                            className="rounded-md border-none bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Note'}
                        </Button>
                        <Button
                            onClick={() => setIsAdding(false)}
                            disabled={isSubmitting}
                            className="rounded-md border-none bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 shadow hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}
            {/* Notes List */}
            <div className="flex flex-col gap-3">
                {notes.length === 0 ? (
                    <Card className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
                        <p className="m-0 text-sm text-gray-500 italic dark:text-gray-400">No notes yet. Add your first note to get started.</p>
                    </Card>
                ) : (
                    notes.map((note) => (
                        <Card key={note.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                            {note.title && <h4 className="text-md mb-2 font-medium text-gray-900 dark:text-gray-100">{note.title}</h4>}
                            <div className="mb-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                {processContentForDisplay(typeof note.content === 'string' ? note.content : '')}
                            </div>
                            {note.tags && note.tags.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-1">
                                        {note.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 text-xs font-medium text-white"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-200 pt-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                <span>
                                    Created: {formatDate(note.created_at)}
                                    {/* Only show source entity if the note was created on a different entity type than current */}
                                    {note.notable_type && !note.notable_type.toLowerCase().includes(entityType.toLowerCase()) && (
                                        <span className="text-gray-400 dark:text-gray-500">
                                            | From{' '}
                                            <a
                                                href={getEntityUrl()}
                                                className="text-blue-500 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {entityType}
                                            </a>
                                        </span>
                                    )}
                                </span>
                                {note.updated_at !== note.created_at && <span>Updated: {formatDate(note.updated_at)}</span>}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotesSection;
