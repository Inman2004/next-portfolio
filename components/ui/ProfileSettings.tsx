/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ProfileImageUpload from '../ProfileImageUpload';

export default function ProfileSettings() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    } else {
      setDisplayName(user.displayName || '');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const result = await updateUserProfile({
        displayName: displayName,
      });

      if (result?.success) {
        setSuccess('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-2xl shadow-xl ring-2 p-8 bg-gradient-to-r from-emerald-50 to-purple-50 dark:from-emerald-900/20 dark:to-purple-900/20 border border-emerald-200/50 dark:border-emerald-700/50">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-emerald-500 to-purple-600 dark:from-emerald-400 dark:to-purple-600 bg-clip-text text-transparent">
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <ProfileImageUpload
              onImageUpdate={() => setSuccess('Profile picture updated successfully!')}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-zinc-700/50 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="Your display name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email || ''}
                className="w-full px-4 py-2 rounded-lg bg-zinc-100/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm" role="alert">{error}</p>
          )}

          {success && (
            <p className="text-green-400 text-sm" role="alert">{success}</p>
          )}

          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Updating...' : 'Update Profile'}
          </m.button>
        </form>
      </div>
    </m.div>
  );
} 