import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export interface TagOption {
  value: string;
  label: string;
}

export function useTagOptions() {
  const [options, setOptions] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/tags')
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch (e) {
          console.error('Failed to parse /api/tags response as JSON', e);
          setOptions([]);
          setLoading(false);
          return;
        }
        if (Array.isArray(data)) {
          setOptions(data.map((tag: any) => ({ value: String(tag.id), label: tag.name })));
        } else {
          setOptions([]);
          if (data && data.error) {
            console.error('Failed to fetch tags:', data.error);
          } else {
            console.error('Failed to fetch tags: Unexpected response', data);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        setOptions([]);
        setLoading(false);
        console.error('Failed to fetch tags:', err);
      });
  }, []);

  const createTag = async (name: string): Promise<TagOption | null> => {
    // Use fetch for AJAX-style tag creation to avoid Inertia 302/redirect issues
    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const tempId = `temp-${Date.now()}`;
    const tempOption = { value: tempId, label: name };
    setOptions(prev => [...prev, tempOption]);
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const tag = await res.json();
        const option = { value: String(tag.id), label: tag.name };
        setOptions(prev => {
          return prev.map(o => o.value === tempId ? option : o).some(o => o.value === option.value)
            ? prev.map(o => o.value === tempId ? option : o)
            : [...prev.filter(o => o.value !== tempId), option];
        });
        return option;
      } else {
        setOptions(prev => prev.filter(o => o.value !== tempId));
      }
    } catch {
      setOptions(prev => prev.filter(o => o.value !== tempId));
    }
    return null;
  };

  return { options, loading, createTag };
}
