'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSettings from '@/components/ProfileSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// This is a Client Component
export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <Card className="sticky top-8">
                <CardHeader className="items-center text-center">
                  <Skeleton className="h-32 w-32 rounded-full mb-4" />
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
              </Card>
            </div>
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64 mb-6" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                    <Skeleton className="h-10 w-32 ml-auto mt-6" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.href = '/signin'}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 md:p-8 my-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <Card className="sticky top-8">
              <CardHeader className="items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.displayName || user.email)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{user.displayName || 'User'}</CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </CardHeader>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-xs mb-6">
                <TabsTrigger value="profile" onClick={() => setActiveTab('profile')}>
                  Profile
                </TabsTrigger>
                <TabsTrigger value="settings" onClick={() => setActiveTab('settings')}>
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile information and avatar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileSettings />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Email</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Account Created</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.metadata?.creationTime}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Button variant="destructive">Delete Account</Button>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}