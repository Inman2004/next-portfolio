'use client';

import { motion } from 'framer-motion';
import { Skeleton } from './skeleton';

export function BlogLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
  {/* Hero Section */}
  <div className="relative overflow-hidden py-10 md:py-12">
    <div className="container mx-auto px-4 relative z-10 text-center">
      <div className="relative">
        <b className="text-4xl animate-pulse md:text-6xl mb-6 text-zinc-600/50 p-2 font-extrabold" >Blogs..</b>
      </div>
      <p className="h-14 py-6 w-3/4 animate-pulse text-xl text-zinc-400/30 max-w-md mx-auto rounded-md" >Getting blogs please wait...</p>
    </div>
  </div>
  {/* Header Skeleton */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
    <div>
      <Skeleton className="h-9 w-40 mb-2 rounded-md" />
      <Skeleton className="h-4 w-64 rounded" />
    </div>
    <Skeleton className="hidden md:block h-10 w-32 rounded-lg" />
  </div>

  {/* Sort Controls Skeleton */}
  <div className="flex flex-wrap gap-2 mb-10 bg-white/50 dark:bg-zinc-800/30 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 max-w-max">
    <Skeleton className="h-9 w-24 rounded-lg" />
    <Skeleton className="h-9 w-20 rounded-lg" />
    <Skeleton className="h-9 w-28 rounded-lg" />
  </div>
        
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, index) => (
      <m.article
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-800/30 h-full flex flex-col shadow-lg"
      >
        {/* Admin Badge Skeleton */}
        <div className="absolute top-3 right-3 z-10">
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        
        {/* Cover Image Skeleton */}
        <Skeleton className="h-48 w-full rounded-t-2xl" />

        {/* Content Skeleton */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <Skeleton className="h-7 w-3/4 mb-3 rounded-md" />
          
          {/* Excerpt */}
          <div className="space-y-3 flex-1 mb-4">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          {/* Author and Date */}
          <div className="mt-auto pt-4 border-t border-zinc-200/70 dark:border-zinc-700/50 flex items-center">
            <Skeleton className="w-8 h-8 rounded-full mr-3" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <div className="flex items-center text-sm">
              <Skeleton className="h-4 w-4 rounded-full mr-1.5" />
              <Skeleton className="h-3.5 w-10 rounded" />
            </div>
          </div>
        </div>
      </m.article>
    ))}
  </div>
</>
  );
}
