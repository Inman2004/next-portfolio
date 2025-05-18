'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createBlogPost } from '@/lib/blog';
import { motion } from 'framer-motion';

export default function CreateBlogPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const postData = {
        title: title.trim(),
        content: content.trim(),
        author: user.displayName?.trim() || 'Anonymous',
        authorId: user.uid,
        authorPhotoURL: user.photoURL || undefined,
        published: true,
        excerpt: content.trim().substring(0, 160) + (content.length > 160 ? '...' : ''),
      };
      
      await createBlogPost(postData);
      
      // Redirect to blog page after successful creation
      router.push('/blog');
      router.refresh(); // Ensure the latest posts are loaded
    } catch (err) {
      console.error('Error creating post:', err);
      setError(
        err instanceof Error 
          ? `Failed to create post: ${err.message}`
          : 'Failed to create post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800/50 p-8 rounded-lg"
        >
          <h1 className="text-2xl font-bold text-white mb-6">Create New Post</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter post title"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your post content here..."
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/blog')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
