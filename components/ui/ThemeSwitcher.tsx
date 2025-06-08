'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function ThemeSwitcher({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Ensure we're rendering on the client to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on the server to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="default"
        className={cn(
          "w-10 h-10 p-0 rounded-full transition-colors",
          "hover:bg-accent/50 dark:hover:bg-accent/30",
          className
        )}
        aria-label="Toggle theme"
        disabled
        {...props}
      >
        <div className="w-5 h-5" />
      </Button>
    );
  }

  const toggleTheme = () => {
    setIsPressed(true);
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // The ThemeWrapper will handle the actual theme application and dispatch the event
    
    setTimeout(() => setIsPressed(false), 200);
  };

  const currentTheme = resolvedTheme || 'light';
  const isDark = currentTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="default"
      className={cn(
        'w-10 h-10 p-0 rounded-full relative overflow-hidden',
        'transition-all duration-300 ease-in-out',
        'hover:bg-accent/50 dark:hover:bg-accent/30',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2',
        'active:scale-95',
        'group',
        className
      )}
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      {...props}
    >
      <div className="relative w-full h-full">
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'transform transition-transform duration-500 ease-in-out',
            isDark ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0',
            isHovered && 'scale-110',
            isPressed && 'scale-95'
          )}
          aria-hidden={!isDark}
        >
          <Sun className="w-5 h-5 text-amber-400" />
        </div>
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'transform transition-transform duration-500 ease-in-out',
            !isDark ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
            isHovered && 'scale-110',
            isPressed && 'scale-95'
          )}
          aria-hidden={isDark}
        >
          <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
}
