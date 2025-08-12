'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLoadingState } from '@/hooks/useLoadingState';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Clock, Calendar, Crown, ArrowRight } from 'lucide-react';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { formatNumber } from '@/lib/formatNumber';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import Markdown from 'react-markdown';

type Post = {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string; // ISO
  readingTime?: string;
  views?: number;
  tags?: string[];
  isAdmin?: boolean;
  author?: { name?: string; photoURL?: string; bio?: string } | null;
  authorPhotoURL?: string | null;
};

type SortOption = 'newest' | 'oldest' | 'popular';

interface BlogListClientProps {
  posts: Post[];
}

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const { startLoading, stopLoading } = useLoadingState();

  const allTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    posts?.forEach((p) => p.tags?.forEach((t) => {
      const key = String(t).trim();
      if (!key) return;
      tagCounts[key] = (tagCounts[key] || 0) + 1;
    }));
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const toggleTag = (tag: string) => {
    startLoading();
    const next = new Set(selectedTags);
    if (next.has(tag)) next.delete(tag); else next.add(tag);
    setSelectedTags(next);
    setTimeout(() => stopLoading(), 300); // Short delay to show loading effect
  };

  const clearTags = () => {
    startLoading();
    setSelectedTags(new Set());
    setTimeout(() => stopLoading(), 300); // Short delay to show loading effect
  };

  // Show loading state when filters change
  useEffect(() => {
    startLoading();
    const timer = setTimeout(() => stopLoading(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, selectedTags, startLoading, stopLoading]);

  const filteredAndSorted = useMemo(() => {
    let list = posts ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        (p.title?.toLowerCase().includes(q)) ||
        (p.excerpt?.toLowerCase().includes(q)) ||
        (p.content?.toLowerCase().includes(q)) ||
        (p.tags || []).some((t) => String(t).toLowerCase().includes(q))
      );
    }
    if (selectedTags.size > 0) {
      list = list.filter((p) => p.tags?.some((t) => selectedTags.has(t)));
    }
    const copy = [...list];
    copy.sort((a, b) => {
      if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? tb - ta : ta - tb;
    });
    return copy;
  }, [posts, searchQuery, sortBy, selectedTags]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Latest Posts</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover the latest articles and tutorials</p>
        </div>
        <div className="w-full md:w-auto md:flex-1 max-w-md">
          <BlogSearch 
            searchQuery={searchQuery} 
            onSearchChange={(query) => {
              startLoading();
              setSearchQuery(query);
              setTimeout(() => stopLoading(), 300);
            }} 
            placeholder="Search blog posts..." 
            className="w-full" 
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { startLoading(); setSortBy('newest'); setTimeout(() => stopLoading(), 300); }} className={`px-3 py-1.5 rounded-md text-sm ${sortBy === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Newest</button>
        <button onClick={() => { startLoading(); setSortBy('oldest'); setTimeout(() => stopLoading(), 300); }} className={`px-3 py-1.5 rounded-md text-sm ${sortBy === 'oldest' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Oldest</button>
        <button onClick={() => { startLoading(); setSortBy('popular'); setTimeout(() => stopLoading(), 300); }} className={`px-3 py-1.5 rounded-md text-sm ${sortBy === 'popular' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Most Popular</button>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Filter by tags:</span>
          {allTags.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => toggleTag(name)}
              className={`px-3 py-1.5 rounded-full text-xs border ${selectedTags.has(name) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'}`}
              aria-pressed={selectedTags.has(name)}
            >
              {name}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}
          {selectedTags.size > 0 && (
            <button onClick={clearTags} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Clear</button>
          )}
        </div>
      )}

      {filteredAndSorted.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">No blog posts found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredAndSorted.map((post) => (
            <article key={post.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-gray-700 dark:border-gray-700">
              {post.coverImage && (
                <div className="relative h-48 overflow-hidden">
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  {post.isAdmin && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Crown className="w-3 h-3 mr-1" /> Admin
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center mr-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readingTime || '5 min read'}</span>
                  </div>
                  <div className="flex items-center ml-auto">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{formatNumber(post.views || 0)}</span>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{post.title}</h2>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{post.excerpt || (post.content ? <Markdown>{post.content}</Markdown> : '')}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {post.author?.photoURL ? (
                      <UserAvatar photoURL={post.author.photoURL} displayName={post.author.name || 'Anonymous'} size={32} className="h-8 w-8 mr-3" />
                    ) : null}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author?.name || 'Anonymous'}</p>
                      {post.author?.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{post.author.bio}</p>
                      )}
                    </div>
                  </div>
                  <Link href={`/blog/${post.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors">
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}


