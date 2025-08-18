'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';

export default function SendNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    blogId: '',
    creatorId: '',
    creatorName: '',
    creatorPhotoURL: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.blogId || !formData.creatorId || !formData.creatorName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/send-blog-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Notifications sent successfully! ${data.successfulEmails} emails sent, ${data.failedEmails} failed.`);
        setFormData({
          blogId: '',
          creatorId: '',
          creatorName: '',
          creatorPhotoURL: ''
        });
      } else {
        toast.error(data.error || 'Failed to send notifications');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Failed to send notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Send Blog Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send email notifications to all subscribers when a new blog post is published.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Notifications
          </CardTitle>
          <CardDescription>
            Fill in the details below to send notifications to all blog subscribers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blogId">Blog Post ID *</Label>
              <Input
                id="blogId"
                placeholder="Enter the blog post ID"
                value={formData.blogId}
                onChange={(e) => handleInputChange('blogId', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorId">Creator ID *</Label>
              <Input
                id="creatorId"
                placeholder="Enter the creator's user ID"
                value={formData.creatorId}
                onChange={(e) => handleInputChange('creatorId', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorName">Creator Name *</Label>
              <Input
                id="creatorName"
                placeholder="Enter the creator's display name"
                value={formData.creatorName}
                onChange={(e) => handleInputChange('creatorName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorPhotoURL">Creator Photo URL (Optional)</Label>
              <Input
                id="creatorPhotoURL"
                placeholder="Enter the creator's photo URL"
                value={formData.creatorPhotoURL}
                onChange={(e) => handleInputChange('creatorPhotoURL', e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Notifications...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notifications
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>1. <strong>Blog Post ID:</strong> The unique identifier of the blog post (found in the URL)</p>
            <p>2. <strong>Creator ID:</strong> The user ID of the blog post author</p>
            <p>3. <strong>Creator Name:</strong> The display name that will appear in the email</p>
            <p>4. <strong>Creator Photo:</strong> Optional profile picture for the email header</p>
            <p className="mt-4 text-amber-600 dark:text-amber-400">
              ⚠️ This will send emails to ALL active subscribers of the blog. Use with caution.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
