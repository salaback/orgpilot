import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectFieldProps {
    id: string;
    label: string;
    values: string[];
    onChange: (values: string[]) => void;
    options: MultiSelectOption[];
    error?: string;
    placeholder?: string;
    className?: string;
    onCreateOption?: (name: string) => void;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
    id,
    label,
    values,
    onChange,
    options,
    error,
    placeholder,
    className,
    onCreateOption,
}) => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(
        (opt) => typeof opt.label === 'string' && opt.label.toLowerCase().includes(input.toLowerCase()) && !values.includes(opt.value),
    );

    const handleSelect = (value: string) => {
        if (!values.includes(value)) {
            onChange([...values, value]);
            setInput('');
        }
    };
    const handleRemove = (value: string) => {
        onChange(values.filter((v) => v !== value));
    };
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            if (filteredOptions.length === 0 && onCreateOption) {
                onCreateOption(input.trim());
                setInput('');
            } else if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0].value);
            }
            e.preventDefault();
        }
    };

    return (
        <div ref={ref} className={className} style={{ position: 'relative' }}>
            <Label htmlFor={id}>{label}</Label>
            <div
                className="relative mt-2 flex min-h-[40px] cursor-text flex-wrap items-center rounded border bg-white px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500"
                tabIndex={-1}
                onClick={(e) => {
                    if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                        setOpen(true);
                        setInput('');
                        setTimeout(() => inputRef.current?.focus(), 0);
                    }
                }}
                id={id}
            >
                {values.length === 0 && !input && !open && (
                    <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-gray-400 select-none">
                        {placeholder || 'Select...'}
                    </span>
                )}
                {values.map((val) => {
                    const opt = options.find((o) => o.value === val);
                    return (
                        <span key={val} className="mr-1 mb-1 flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                            {opt ? opt.label : val}
                            <button
                                type="button"
                                className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(val);
                                }}
                                aria-label={`Remove ${opt ? opt.label : val}`}
                            >
                                <X size={14} />
                            </button>
                        </span>
                    );
                })}
                <input
                    ref={inputRef}
                    className="min-w-[80px] flex-1 border-none bg-transparent text-sm outline-none"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={handleInputKeyDown}
                    placeholder=""
                    style={{ minWidth: 80 }}
                />
            </div>
            {open && (
                <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded border bg-white shadow" role="listbox">
                    {filteredOptions.length === 0 && input.trim() && onCreateOption ? (
                        <li
                            className="flex cursor-pointer items-center px-3 py-2 text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                                onCreateOption(input.trim());
                                setInput('');
                            }}
                        >
                            <Plus size={16} className="mr-2" />
                            Create "{input.trim()}"
                        </li>
                    ) : filteredOptions.length === 0 ? (
                        <li className="px-3 py-2 text-gray-400 select-none">No options</li>
                    ) : (
                        filteredOptions.map((opt) => (
                            <li
                                key={opt.value}
                                className="cursor-pointer px-3 py-2 hover:bg-blue-50"
                                role="option"
                                aria-selected={false}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(opt.value);
                                }}
                            >
                                {opt.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};
