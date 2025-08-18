'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Bell, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth } from '@/lib/auth';

interface BlogSubscriptionProps {
  blogId: string;
  creatorName: string;
  isSubscribed?: boolean;
}

export default function BlogSubscription({
  blogId,
  creatorName,
  isSubscribed = false
}: BlogSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [localSubscriptionStatus, setLocalSubscriptionStatus] = useState(isSubscribed);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      toast.error('Please sign in to subscribe to notifications');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubscribing(true);
    
    try {
      const response = await fetch('/api/blog/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogId,
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Successfully subscribed to blog notifications!');
        setLocalSubscriptionStatus(true);
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (localSubscriptionStatus) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Subscribed to notifications</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                You'll receive email updates when {creatorName} publishes new content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Stay Updated
        </CardTitle>
        <CardDescription>
          Subscribe to get notified when <b className="text-slate-900 dark:text-slate-200">{creatorName}</b> publishes new blog posts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubscribing || !email.trim()}
            className="w-full"
          >
            {isSubscribing ? (
              <>
                <Mail className="h-4 w-4 mr-2 animate-pulse" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe to Notifications
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            We'll send you an email when new content is published. 
            You can unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
