'use client';

import { useState, KeyboardEvent, FC } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

const TagInput: FC<TagInputProps> = ({ value = [], onChange, placeholder, className }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const newTag = tag.trim();
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2 rounded-md border border-input bg-transparent p-2', className)}>
      {value.map((tag, index) => (
        <span key={index} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground">
          {tag}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full"
            onClick={() => removeTag(tag)}
          >
            <X className="h-3 w-3" />
          </Button>
        </span>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Add a tag and press Enter...'}
        className="h-auto min-w-[120px] flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
};

export default TagInput;