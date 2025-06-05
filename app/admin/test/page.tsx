'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

export default function TestPage() {
  const { user, isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirecting in useAdminAuth
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <p>You have admin access!</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}
