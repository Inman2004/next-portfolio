'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const blogId = searchParams.get('blog');
    const email = searchParams.get('email');

    if (!blogId || !email) {
      setStatus('not-found');
      setMessage('Invalid unsubscribe link. Missing required parameters.');
      return;
    }

    // Call unsubscribe API
    const unsubscribe = async () => {
      try {
        const response = await fetch('/api/blog/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blogId,
            email,
          }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('You have been successfully unsubscribed from blog notifications.');
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.error || 'Failed to unsubscribe. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while processing your request.');
      }
    };

    unsubscribe();
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p>Processing your unsubscribe request...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              Successfully Unsubscribed
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {message}
            </p>
            <Button asChild>
              <a href="/blog">Return to Blog</a>
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
              Unsubscribe Failed
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {message}
            </p>
            <Button asChild>
              <a href="/blog">Return to Blog</a>
            </Button>
          </div>
        );

      case 'not-found':
        return (
          <div className="text-center">
            <Mail className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Invalid Unsubscribe Link
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {message}
            </p>
            <Button asChild>
              <a href="/blog">Return to Blog</a>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Unsubscribe</CardTitle>
          <CardDescription>
            Manage your email preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}