'use client';

import { useTheme } from 'next-themes';

export function useThemeUtils() {
  const { theme, systemTheme } = useTheme();
  
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const isLight = theme === 'light' || (theme === 'system' && systemTheme === 'light');
  
  // Utility function to get theme-aware class names
  const themeClass = (lightClass: string, darkClass: string) => {
    return isDark ? darkClass : lightClass;
  };
  
  // Get current theme name (resolved system theme)
  const currentTheme = theme === 'system' ? systemTheme : theme;
  
  return {
    isDark,
    isLight,
    themeClass,
    currentTheme,
    theme: theme as 'light' | 'dark' | 'system',
  };
}

// Utility function to get theme-aware styles
interface ThemeStyles {
  light: React.CSSProperties;
  dark: React.CSSProperties;
}

export function useThemeStyles(styles: ThemeStyles): React.CSSProperties {
  const { isDark } = useThemeUtils();
  return isDark ? styles.dark : styles.light;
}

// Utility function to get theme-aware color variables
export const themeColors = {
  background: 'bg-background',
  foreground: 'text-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  accent: 'bg-accent text-accent-foreground',
  muted: 'bg-muted text-muted-foreground',
  card: 'bg-card text-card-foreground',
  popover: 'bg-popover text-popover-foreground',
  border: 'border-border',
  input: 'bg-input text-foreground',
  ring: 'ring-ring',
  destructive: 'bg-destructive text-destructive-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-info text-info-foreground',
  error: 'bg-error text-error-foreground',
} as const;

type ThemeColor = keyof typeof themeColors;

export function useThemeColor(color: ThemeColor) {
  return themeColors[color];
}
