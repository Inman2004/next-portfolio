'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { BlogCacheProvider } from '@/contexts/BlogCacheContext';
import { LoadingProvider } from '@/hooks/useLoadingState';
import { ChatProvider } from '@/contexts/ChatContext';
import emailjs from '@emailjs/browser';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      if (!publicKey) {
        console.error('EmailJS public key is not configured');
        return;
      }
      emailjs.init(publicKey);
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
  }, []);

  return (
    <AuthProvider>
      <BlogCacheProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'system']}
        >
          <ThemeProvider>
            <ChatProvider>
              <LoadingProvider>
                {children}
              </LoadingProvider>
            </ChatProvider>
          </ThemeProvider>
        </NextThemesProvider>
      </BlogCacheProvider>
    </AuthProvider>
  );
}