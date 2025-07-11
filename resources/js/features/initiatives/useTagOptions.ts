import { useState, useEffect } from 'react';

interface TagOption {
  value: string;
  label: string;
}

interface Tag {
  id: number;
  name: string;
}

export const useTagOptions = () => {
  const [options, setOptions] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const tags: Tag[] = await response.json();
          const tagOptions: TagOption[] = tags.map(tag => ({
            value: String(tag.id),
            label: tag.name,
          }));
          setOptions(tagOptions);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const createTag = async (name: string): Promise<TagOption | null> => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newTag: Tag = await response.json();
        const tagOption: TagOption = {
          value: String(newTag.id),
          label: newTag.name,
        };
        setOptions(prev => [...prev, tagOption]);
        return tagOption;
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
    return null;
  };

  return { options, loading, createTag };
};
