'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeScript />
      {children}
    </NextThemesProvider>
  );
}

// Client-side script to prevent theme flickering
function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Get the saved theme or fallback to system preference
              const savedTheme = localStorage.getItem('theme');
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              let theme = savedTheme || 'system';
              
              // Resolve system theme if needed
              if (theme === 'system') {
                theme = systemPrefersDark ? 'dark' : 'light';
              }
              
              // Apply the theme immediately to prevent flash of incorrect theme
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
              }
              
              // Store the resolved theme
              document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {
              console.error('Error setting theme:', e);
            }
          })();
        `,
      }}
    />
  );
}
