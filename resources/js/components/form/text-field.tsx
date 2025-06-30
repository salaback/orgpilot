import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);
