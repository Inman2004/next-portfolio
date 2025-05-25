'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function AuthTestPage() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading auth state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Auth Test Page</h1>
      
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Firebase Auth</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto text-sm">
          {JSON.stringify({ firebaseUser }, null, 2)}
        </pre>
      </div>

      <div className="mt-6 p-6 bg-blue-900/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current Auth State</h2>
        <p className="mb-2">
          <span className="font-medium">Is Authenticated:</span>{' '}
          {status === 'authenticated' || firebaseUser ? 'Yes' : 'No'}
        </p>
        <p>
          <span className="font-medium">User ID:</span>{' '}
          {session?.user?.id || firebaseUser?.uid || 'Not logged in'}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Test Links</h2>
        <div className="flex gap-4">
          <a 
            href="/blog/new" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Try Create Post
          </a>
          <a 
            href="/signin" 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            Go to Sign In
          </a>
          <a 
            href="/api/auth/signout" 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}
