'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps as NextThemeProviderProps, useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// Extend the theme provider props to include our custom props
type ThemeProviderProps = NextThemeProviderProps & {
  children: React.ReactNode;
};

// Custom hook to get theme with initial state
function useTheme() {
  const { theme, resolvedTheme, setTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    theme: mounted ? theme : 'light',
    resolvedTheme: mounted ? resolvedTheme : 'light',
    systemTheme,
    setTheme,
    mounted
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeInitializer>
        {children}
      </ThemeInitializer>
    </NextThemesProvider>
  );
}

// Component to handle theme initialization and prevent flickering
function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, mounted } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (mounted) {
      // Add theme class to body
      document.documentElement.classList.remove('light', 'dark');
      if (resolvedTheme) {
        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.style.setProperty('color-scheme', resolvedTheme);
      }
      
      // Small delay to ensure all styles are applied before showing content
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [mounted, resolvedTheme]);

  // Don't render children until theme is initialized
  if (!isInitialized || !mounted) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-900 transition-colors duration-200" />
    );
  }

  return <>{children}</>;
}
