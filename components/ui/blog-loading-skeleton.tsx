'use client';

import { motion } from 'framer-motion';

export function BlogLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/30 rounded-2xl border border-gray-200/70 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
        >
          {/* Cover Image Skeleton */}
          <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse"></div>
          
          {/* Content Skeleton */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Title */}
            <div className="h-7 bg-gray-200/70 dark:bg-white/10 rounded-lg w-3/4 mb-4 animate-pulse"></div>
            
            {/* Excerpt */}
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-gray-100/70 dark:bg-white/5 rounded w-full"></div>
              <div className="h-4 bg-gray-100/70 dark:bg-white/5 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100/70 dark:bg-white/5 rounded w-4/6"></div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="h-6 w-16 bg-gray-100/70 dark:bg-white/5 rounded-full animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-100/70 dark:bg-white/5 rounded-full animate-pulse"></div>
            </div>
            
            {/* Author and Date */}
            <div className="mt-4 pt-4 border-t border-gray-200/70 dark:border-gray-700/50 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200/70 dark:bg-white/10 animate-pulse mr-3"></div>
              <div className="flex-1">
                <div className="h-3.5 bg-gray-200/70 dark:bg-white/10 rounded w-24 mb-1.5 animate-pulse"></div>
                <div className="h-2.5 bg-gray-100/70 dark:bg-white/5 rounded w-20 animate-pulse"></div>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="h-4 w-4 bg-gray-200/70 dark:bg-white/10 rounded-full mr-1.5"></div>
                <div className="h-3.5 bg-gray-100/70 dark:bg-white/5 rounded w-10 animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
