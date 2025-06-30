import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  placeholder?: string;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, onChange, options, error, placeholder, className }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className={className ? className + ' mt-2' : 'mt-2'}>
        <SelectValue placeholder={placeholder || 'Select...'} />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

