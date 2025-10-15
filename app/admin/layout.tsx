'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  console.log('AdminLayout: Rendering admin layout');
  const { user, isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();

  // Redirect to signin if not loading and not admin
  useEffect(() => {
    console.log('AdminLayout: Auth state -', { 
      isLoading, 
      hasUser: !!user, 
      isAdmin, 
      userEmail: user?.email 
    });
    
    if (!isLoading) {
      if (!user) {
        console.log('AdminLayout: No user found, redirecting to signin');
        router.push('/signin?callbackUrl=/admin');
      } else if (!isAdmin) {
        console.log('AdminLayout: User is not an admin, redirecting to unauthorized');
        router.push('/unauthorized');
      } else {
        console.log('AdminLayout: User is authenticated and is an admin');
      }
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Don't render anything if not admin or no user
  if (!isAdmin || !user) {
    return null;
  }

  return (
    <div className="flex h-screen dark:bg-zinc-900 bg-zinc-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
