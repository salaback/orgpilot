import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

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

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({ id, label, values, onChange, options, error, placeholder, className, onCreateOption }) => {
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

  const filteredOptions = options.filter(opt =>
    typeof opt.label === 'string' &&
    opt.label.toLowerCase().includes(input.toLowerCase()) &&
    !values.includes(opt.value)
  );

  const handleSelect = (value: string) => {
    if (!values.includes(value)) {
      onChange([...values, value]);
      setInput('');
    }
  };
  const handleRemove = (value: string) => {
    onChange(values.filter(v => v !== value));
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
        className="mt-2 border rounded px-2 py-1 min-h-[40px] flex flex-wrap items-center cursor-text bg-white focus-within:ring-2 focus-within:ring-blue-500 relative"
        tabIndex={-1}
        onClick={e => {
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            setOpen(true);
            setInput('');
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        id={id}
      >
        {values.length === 0 && !input && !open && (
          <span className="text-gray-400 select-none pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">{placeholder || 'Select...'}</span>
        )}
        {values.map(val => {
          const opt = options.find(o => o.value === val);
          return (
            <span key={val} className="flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 mr-1 mb-1 text-xs">
              {opt ? opt.label : val}
              <button
                type="button"
                className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                onClick={e => { e.stopPropagation(); handleRemove(val); }}
                aria-label={`Remove ${opt ? opt.label : val}`}
              >
                <X size={14} />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          className="flex-1 outline-none border-none bg-transparent min-w-[80px] text-sm"
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); }}
          onKeyDown={handleInputKeyDown}
          placeholder=""
          style={{ minWidth: 80 }}
        />
      </div>
      {open && (
        <ul className="absolute z-50 mt-1 bg-white border rounded shadow w-full max-h-48 overflow-auto" role="listbox">
          {filteredOptions.length === 0 && input.trim() && onCreateOption ? (
            <li
              className="px-3 py-2 text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center"
              onClick={() => { onCreateOption(input.trim()); setInput(''); }}
            >
              <Plus size={16} className="mr-2" />Create "{input.trim()}"
            </li>
          ) : filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-gray-400 select-none">No options</li>
          ) : filteredOptions.map(opt => (
            <li
              key={opt.value}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
              role="option"
              aria-selected={false}
              onClick={e => { e.stopPropagation(); handleSelect(opt.value); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
