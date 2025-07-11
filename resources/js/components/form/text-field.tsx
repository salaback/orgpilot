import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface TextFieldProps {
    id: string;
    name?: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    className?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ id, name, label, value, onChange, placeholder, error, type = 'text', className }) => (
    <div>
        <Label htmlFor={id}>{label}</Label>
        <Input
            id={id}
            name={name || id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type}
            className={className ? className + ' mt-2' : 'mt-2'}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);
