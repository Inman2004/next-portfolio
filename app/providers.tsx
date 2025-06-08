'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import emailjs from '@emailjs/browser';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
  value?: Record<string, string>;
};

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      if (!publicKey) {
        console.error('EmailJS public key is not configured');
        return;
      }
      
      // Initialize EmailJS
      emailjs.init(publicKey);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
    
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering the ThemeProvider on the server
  if (!mounted) {
    return (
      <AuthProvider>
        <Header />
        <main>
          {children}
        </main>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={['light', 'dark']}
      >
        <ThemeWrapper>
          <main className="min-h-screen bg-background text-foreground transition-colors duration-200">
            {children}
          </main>
        </ThemeWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Wrapper component to handle theme changes and apply classes
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Apply theme class to document element and handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Function to apply theme
    const applyTheme = (themeToApply: string | undefined) => {
      if (!themeToApply) return;
      
      // Remove all theme classes first
      root.classList.remove('light', 'dark');
      
      // Add the current theme class
      root.classList.add(themeToApply);
      
      // Set data-theme attribute for better CSS variable support
      root.setAttribute('data-theme', themeToApply);
      
      // Update color scheme
      root.style.colorScheme = themeToApply;
      
      // Dispatch custom event for other components to listen to
      const event = new CustomEvent('theme-changed', { 
        detail: { theme: themeToApply }
      });
      window.dispatchEvent(event);
    };
    
    // Set initial theme
    setMounted(true);
    
    // Get the current theme, defaulting to system theme if not set
    const currentTheme = theme === 'system' ? systemTheme : theme;
    if (currentTheme) {
      applyTheme(currentTheme);
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        applyTheme(newTheme);
      }
    };
    
    // Add transition class after initial render
    const timer = setTimeout(() => {
      root.classList.add('theme-transition');
    }, 0);
    
    // Add event listeners
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme, systemTheme]);

  // Don't render children until we've set the theme
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}