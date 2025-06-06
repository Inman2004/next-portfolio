'use client';

import { motion } from 'framer-motion';

export function BlogLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <motion.article
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-2xl backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/30 hover:border-gray-300/80 dark:hover:border-gray-600/80 transition-all duration-300 h-full flex flex-col shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-500/30"
        >
          {/* Admin Badge Skeleton */}
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-white/90 dark:bg-gray-900/90 w-16 h-6 rounded-full border border-gray-200 dark:border-gray-700 backdrop-blur-sm animate-pulse"></div>
          </div>
          
          {/* Cover Image Skeleton */}
          <div className="h-48 bg-gradient-to-r from-blue-900/30 to-purple-900/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 dark:from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/90 hover:bg-blue-700 text-white dark:bg-blue-500/90 dark:hover:bg-blue-400/90 w-24 h-6"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Title */}
            <div className="h-7 bg-gray-200/70 dark:bg-white/10 rounded-lg w-3/4 mb-3 animate-pulse"></div>
            
            {/* Excerpt */}
            <div className="space-y-3 flex-1 mb-4">
              <div className="h-4 bg-gray-100/70 dark:bg-white/5 rounded w-full"></div>
              <div className="h-4 bg-gray-100/70 dark:bg-white/5 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100/70 dark:bg-white/5 rounded w-4/6"></div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-6 w-16 bg-gray-100/70 dark:bg-white/5 rounded-full animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-100/70 dark:bg-white/5 rounded-full animate-pulse"></div>
            </div>
            
            {/* Author and Date */}
            <div className="mt-auto pt-4 border-t border-gray-200/70 dark:border-gray-700/50 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200/70 dark:bg-white/10 animate-pulse mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200/70 dark:bg-white/10 rounded w-24 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-100/70 dark:bg-white/5 rounded w-20 animate-pulse"></div>
              </div>
              <div className="flex items-center text-sm">
                <div className="h-4 w-4 bg-gray-200/70 dark:bg-white/10 rounded-full mr-1.5"></div>
                <div className="h-3.5 bg-gray-100/70 dark:bg-white/5 rounded w-10 animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
