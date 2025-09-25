'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Crown, Users, Calendar, Mail, Bell, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth } from '@/lib/auth';
import Link from 'next/link';

interface UserSubscription {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorPhotoURL?: string;
  tier: string;
  status: string;
  startDate: string;
  endDate?: string;
}

interface BlogSubscription {
  id: string;
  blogId: string;
  creatorName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function SubscriptionsDashboard() {
  const [memberships, setMemberships] = useState<UserSubscription[]>([]);
  const [blogSubscriptions, setBlogSubscriptions] = useState<BlogSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        window.location.href = '/signin';
        return;
      }
      setUser(currentUser);
      await loadSubscriptions();
    };

    checkAuth();
  }, []);

  const loadSubscriptions = async () => {
    try {
      // Load memberships
      const membershipsResponse = await fetch('/api/membership/user-subscriptions');
      if (membershipsResponse.ok) {
        const data = await membershipsResponse.json();
        setMemberships(data.subscriptions);
      }

      // Load blog subscriptions
      const blogResponse = await fetch('/api/blog/user-subscriptions');
      if (blogResponse.ok) {
        const data = await blogResponse.json();
        setBlogSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelMembership = async (subscriptionId: string, creatorId: string) => {
    try {
      const response = await fetch('/api/membership/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId }),
      });

      if (response.ok) {
        toast.success('Membership cancelled successfully');
        await loadSubscriptions(); // Refresh the list
      } else {
        toast.error('Failed to cancel membership');
      }
    } catch (error) {
      console.error('Error cancelling membership:', error);
      toast.error('Failed to cancel membership');
    }
  };

  const unsubscribeFromBlog = async (subscriptionId: string, blogId: string) => {
    try {
      const response = await fetch('/api/blog/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId }),
      });

      if (response.ok) {
        toast.success('Unsubscribed from blog notifications');
        await loadSubscriptions(); // Refresh the list
      } else {
        toast.error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to unsubscribe');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Subscriptions</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Manage your memberships and blog notifications
        </p>
      </div>

      <Tabs defaultValue="memberships" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="memberships" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Memberships ({memberships.length})
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Blog Notifications ({blogSubscriptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="memberships" className="space-y-4">
          {memberships.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Crown className="h-16 w-16 mx-auto text-zinc-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Memberships Yet</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  You haven't subscribed to any creator memberships yet.
                </p>
                <Button asChild>
                  <Link href="/blog">Discover Creators</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memberships.map((membership) => (
                <Card key={membership.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        photoURL={membership.creatorPhotoURL}
                        displayName={membership.creatorName}
                        size={48}
                      />
                      <div>
                        <CardTitle className="text-lg">{membership.creatorName}</CardTitle>
                        <CardDescription>
                          {membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)} Tier
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Status:</span>
                      <Badge 
                        variant={membership.status === 'active' ? 'default' : 'secondary'}
                        className={membership.status === 'active' ? 'bg-green-500' : ''}
                      >
                        {membership.status === 'active' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Started:</span>
                      <span>{new Date(membership.startDate).toLocaleDateString()}</span>
                    </div>

                    {membership.status === 'active' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => cancelMembership(membership.id, membership.creatorId)}
                          className="flex-1"
                        >
                          Cancel Membership
                        </Button>
                        <Button size="sm" asChild className="flex-1">
                          <Link href={`/creator/${membership.creatorId}/membership`}>
                            View Creator
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {blogSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Bell className="h-16 w-16 mx-auto text-zinc-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Blog Notifications</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  You haven't subscribed to any blog notifications yet.
                </p>
                <Button asChild>
                  <Link href="/blog">Explore Blogs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {blogSubscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">{subscription.creatorName}</h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {subscription.email}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Subscribed since {new Date(subscription.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={subscription.isActive ? 'default' : 'secondary'}
                          className={subscription.isActive ? 'bg-green-500' : ''}
                        >
                          {subscription.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        
                        {subscription.isActive && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => unsubscribeFromBlog(subscription.id, subscription.blogId)}
                          >
                            Unsubscribe
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Crown className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Find Creators</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Discover new creators to support
              </p>
              <Button asChild size="sm">
                <Link href="/blog">Browse Blogs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Bell className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="font-semibold mb-2">Manage Notifications</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Control your email preferences
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/notifications">Settings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto text-purple-500 mb-4" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Connect with other members
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/community">Join Community</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
