'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Crown, Bell, User, Settings, LogOut, Plus } from 'lucide-react';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function MembershipNav() {
  const [user, setUser] = useState<any>(null);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        await loadUserData();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user's subscription count
      const response = await fetch('/api/membership/user-subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionCount(data.subscriptions.length);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast.success('Signed out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/signin">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Quick Actions */}
      <div className="hidden md:flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/blog" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Discover
          </Link>
        </Button>
        
        {subscriptionCount > 0 && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/subscriptions" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              My Memberships
              <Badge variant="secondary" className="ml-1">
                {subscriptionCount}
              </Badge>
            </Link>
          </Button>
        )}
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative">
            <User className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline-block">{user.displayName || 'User'}</span>
            {subscriptionCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                {subscriptionCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-start p-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <DropdownMenuItem asChild>
            <Link href="/dashboard/subscriptions" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              My Subscriptions
              {subscriptionCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {subscriptionCount}
                </Badge>
              )}
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/dashboard/creator" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Creator Dashboard
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Settings
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
