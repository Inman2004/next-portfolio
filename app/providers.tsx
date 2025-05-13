'use client';

import { useEffect } from 'react';
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
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
      
      // Initialize EmailJS
      emailjs.init(publicKey);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
  }, []);

  return (
    <AuthProvider>
      <Header />
      <main>
        {children}
      </main>
    </AuthProvider>
  );
} 