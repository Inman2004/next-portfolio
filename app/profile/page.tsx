'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

// This component redirects to the user's profile page
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to signin if not authenticated
        router.push('/signin?callbackUrl=/profile');
      } else if (user.username) {
        // Redirect to the user's profile page
        router.push(`/users/${user.username}`);
      } else {
        // If user doesn't have a username, redirect to users page with UID
        router.push(`/users/${user.uid}`);
      }
    }
  }, [user, loading, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to your profile...</p>
      </div>
    </div>
  );
}