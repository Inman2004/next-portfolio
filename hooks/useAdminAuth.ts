'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAdminAuth(redirectTo = '/signin') {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useAdminAuth: Initializing auth state listener');
    
    // Ensure auth is initialized
    if (!auth) {
      console.error('useAdminAuth: Firebase Auth not initialized');
      router.push(redirectTo);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        console.log('useAdminAuth: Auth state changed, current user:', currentUser?.email || 'none');
        try {
          if (currentUser) {
            console.log('useAdminAuth: Current user email:', currentUser.email);
            console.log('useAdminAuth: Current user email verified:', currentUser.emailVerified);
            console.log('useAdminAuth: Current user provider data:', currentUser.providerData);
            
            setUser(currentUser);
            
            // Check if the user is an admin
            const isUserAdmin = currentUser.email === 'rvimman@gmail.com';
            console.log('useAdminAuth: Is admin:', isUserAdmin);
            setIsAdmin(isUserAdmin);
            
            if (!isUserAdmin) {
              console.warn('useAdminAuth: Unauthorized access attempt by:', currentUser.email);
              router.push('/unauthorized');
              return;
            } else {
              console.log('useAdminAuth: User is admin, allowing access');
            }
          } else {
            console.log('useAdminAuth: No user signed in, redirecting to signin');
            router.push(redirectTo);
            return;
          }
        } catch (error) {
          console.error('useAdminAuth: Error in auth state change:', error);
          router.push(redirectTo);
          return;
        } finally {
          console.log('useAdminAuth: Auth state check complete');
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setIsLoading(false);
        router.push(redirectTo);
      }
    );

    return () => unsubscribe();
  }, [router, redirectTo]);

  return { user, isAdmin, isLoading };
}
