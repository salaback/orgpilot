import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP');
}

export function formatTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'p');
}

export function formatDateTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP p');
}
