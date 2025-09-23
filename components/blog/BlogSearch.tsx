'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export function BlogSearch({
  searchQuery,
  onSearchChange,
  className = '',
  placeholder = 'Search posts...',
}: BlogSearchProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background/30 pl-10 pr-4 py-2 backdrop:blur-sm',
          'text-sm ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-shadow duration-200',
          className
        )}
      />
    </div>
  );
}
