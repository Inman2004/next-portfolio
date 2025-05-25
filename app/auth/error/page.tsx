'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  useEffect(() => {
    // Log the error for debugging
    if (error) {
      console.error('Authentication error:', error);
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-2">Authentication Error</h1>
          <p className="text-gray-300 mb-6">
            {error === 'account-exists-with-different-credential'
              ? 'This email is already registered with a different provider.'
              : 'An error occurred during authentication. Please try again.'}
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try signing in with Google again
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Return to home page
            </button>
          </div>
          
          {error && (
            <div className="mt-6 p-3 bg-gray-700 rounded text-xs text-gray-400 overflow-x-auto">
              <p className="font-mono">Error: {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
