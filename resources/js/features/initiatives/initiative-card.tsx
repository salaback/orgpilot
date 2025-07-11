import React from 'react';
import { Initiative } from './types';
import { Employee } from '@/types';

interface InitiativeCardProps {
    initiative: Initiative;
    users: Employee[];
    compact?: boolean;
    onClick?: () => void;
    onSearchChange?: (value: string) => void;
}

const InitiativeCard: React.FC<InitiativeCardProps> = ({ initiative, users, compact, onClick, onSearchChange }) => {
    const assigneeAvatars = (initiative.assignees || [])
        .map((id) => {
            const user = users.find((u) => u.id === id);
            if (!user) return null;

            // Create full name from first_name and last_name, with safer fallback handling
            const firstName = user.first_name || '';
            const lastName = user.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();

            // Create initials more safely with additional checks
            let initials = '?';
            if (fullName && fullName.length > 0) {
                try {
                    initials = fullName
                        .split(' ')
                        .filter((name) => name.length > 0) // Filter out empty strings
                        .map((name) => name[0])
                        .join('')
                        .toUpperCase();
                    // Fallback if no valid initials were created
                    if (!initials || initials.length === 0) {
                        initials = '?';
                    }
                } catch (error) {
                    console.warn('Error creating initials for user:', user, error);
                    initials = '?';
                }
            }

            return (
                <span
                    key={id}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        if (onSearchChange) {
                            onSearchChange(fullName);
                        }
                    }}
                    title={`Click to search for ${fullName}`}
                    className="mr-1 cursor-pointer rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                    {initials}
                </span>
            );
        })
        .filter(Boolean); // Remove any null entries

    // Allocation bar (if any)
    let allocationBar = null;
    if (initiative.allocations && initiative.allocations.length > 0) {
        const total = initiative.allocations.reduce((sum, a) => sum + a.percent, 0);
        allocationBar = (
            <div className="mt-1 mb-1 flex h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                {initiative.allocations.map((a) => {
                    const user = users.find((u) => u.id === a.userId);
                    const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown';
                    return (
                        <div
                            key={a.userId}
                            title={`${userName}: ${a.percent}%`}
                            className="bg-green-400 dark:bg-green-500"
                            style={{ width: `${a.percent}%` }}
                        />
                    );
                })}
                {total < 100 && <div className="bg-gray-200 dark:bg-gray-700" style={{ width: `${100 - total}%` }} />}
            </div>
        );
    }

    // Format due date as localized string
    const formatDueDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return dateString; // Fallback to original string if parsing fails
        }
    };

    return (
        <div
            onClick={onClick}
            className={`mb-2 rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-lg ${compact ? 'p-1' : 'p-3'} ${onClick ? 'dark:hover:bg-gray-750 cursor-pointer hover:bg-gray-50' : ''} ${compact ? 'text-sm' : 'text-base'} `}
        >
            <div className="font-medium text-gray-900 dark:text-gray-100">{initiative.title}</div>
            {!compact && <div className="mt-1 mb-0.5 text-sm text-gray-600 dark:text-gray-400">{initiative.description}</div>}
            <div className="mt-1 flex flex-wrap items-center gap-1">
                {assigneeAvatars.length > 0 ? assigneeAvatars : <span className="text-xs text-gray-400 dark:text-gray-500">Backlog</span>}

                {/* Display tags with proper styling */}
                {Array.isArray(initiative.tags) && initiative.tags.length > 0 && (
                    <div className="ml-2 flex flex-wrap gap-1">
                        {initiative.tags.map((tag, index) => (
                            <span
                                key={typeof tag === 'object' ? tag.id : index}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    if (onSearchChange) {
                                        const tagName = typeof tag === 'object' ? tag.name : tag;
                                        onSearchChange(tagName);
                                    }
                                }}
                                title={`Click to search for ${typeof tag === 'object' ? tag.name : tag}`}
                                className="cursor-pointer rounded-full border border-white/20 bg-gradient-to-r from-blue-500 to-purple-600 px-1.5 py-0.5 text-xs font-medium tracking-wide text-white uppercase shadow-sm transition-transform hover:scale-105 hover:shadow-md"
                            >
                                {typeof tag === 'object' ? tag.name : tag}
                            </span>
                        ))}
                    </div>
                )}

                {initiative.dueDate && <span className="ml-2 text-xs text-red-500 dark:text-red-400">Due: {formatDueDate(initiative.dueDate)}</span>}
            </div>
            {allocationBar}
        </div>
    );
};

export default InitiativeCard;
