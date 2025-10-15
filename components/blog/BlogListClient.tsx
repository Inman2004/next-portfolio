'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Clock, Calendar, Crown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { formatNumber } from '@/lib/formatNumber';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  initialPage?: number;
  initialPostsPerPage?: number;
}

export default function BlogListClient({ posts, initialPage = 1, initialPostsPerPage = 9 }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [postsPerPage, setPostsPerPage] = useState(initialPostsPerPage); // 3x3 grid
  const { startLoading, stopLoading } = useLoadingState();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    setCurrentPage(1); // Reset to first page when filters change
    setTimeout(() => stopLoading(), 300); // Short delay to show loading effect
  };

  const clearTags = () => {
    startLoading();
    setSelectedTags(new Set());
    setCurrentPage(1); // Reset to first page when filters change
    setTimeout(() => stopLoading(), 300); // Short delay to show loading effect
  };

  // Show loading state when filters change
  useEffect(() => {
    startLoading();
    const timer = setTimeout(() => stopLoading(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, selectedTags, startLoading, stopLoading]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Sync URL with pagination state
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }
    if (postsPerPage !== 9) {
      params.set('perPage', postsPerPage.toString());
    } else {
      params.delete('perPage');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(newUrl, { scroll: false });
  }, [currentPage, postsPerPage, router, searchParams]);

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

  // Pagination logic
  const totalPosts = filteredAndSorted.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredAndSorted.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            All Posts ({totalPosts})
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Show:</span>
            <Select value={postsPerPage.toString()} onValueChange={(value) => {
              setPostsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="18">18</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        <button onClick={() => { startLoading(); setSortBy('newest'); setTimeout(() => stopLoading(), 300); }} className={`px-3 py-1.5 rounded-md text-sm ${sortBy === 'newest' ? 'bg-lime-500 text-white dark:text-black font-medium' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}>Newest</button>
        <button onClick={() => { startLoading(); setSortBy('oldest'); setTimeout(() => stopLoading(), 300); }} className={`px-3 py-1.5 rounded-md text-sm ${sortBy === 'oldest' ? 'bg-lime-500 text-white dark:text-black font-medium' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}>Oldest</button>
        <button onClick={() => { startLoading(); setSortBy('popular'); setTimeout(() => stopLoading(), 300); }} className={`px-3 py-1.5 rounded-md text-sm ${sortBy === 'popular' ? 'bg-lime-500 text-white dark:text-black font-medium' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}>Most Popular</button>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-zinc-600 dark:text-zinc-400 mr-1">Filter by tags:</span>
          {allTags.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => toggleTag(name)}
              className={`px-3 py-1.5 rounded-full text-xs border ${selectedTags.has(name) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'}`}
              aria-pressed={selectedTags.has(name) ? 'true' : 'false'}
            >
              {name}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}
          {selectedTags.size > 0 && (
            <button onClick={clearTags} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Clear</button>
          )}
        </div>
      )}

      {filteredAndSorted.length === 0 ? (
        <div className="text-center text-zinc-500 dark:text-zinc-400 py-16">No blog posts found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {currentPosts.map((post) => (
              <article key={post.id} className="group bg-white dark:bg-zinc-800 rounded-xl shadow hover:shadow-xl transition-all overflow-hidden border border-zinc-200 hover:border-zinc-700 dark:border-zinc-700">
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
                  <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 mb-3">
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
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white group">
                    <span className="relative inline-block">
                      <span className="line-clamp-2">{post.title}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </h2>
                  <div className="text-zinc-600 dark:text-zinc-300 text-sm mb-4 line-clamp-3">{post.excerpt || (post.content ? <Markdown>{post.content}</Markdown> : '')}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {post.author?.photoURL ? (
                        <UserAvatar photoURL={post.author.photoURL} displayName={post.author.name || 'Anonymous'} size={32} className="h-8 w-8 mr-3" />
                      ) : null}
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{post.author?.name || 'Anonymous'}</p>
                        {post.author?.bio && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{post.author.bio}</p>
                        )}
                      </div>
                    </div>
                    <Link href={`/blog/${post.id}`} className="inline-flex items-center text-emerald-600 hover:text-sky-700 dark:text-emerald-400 dark:hover:text-sky-300 font-medium text-sm transition-colors">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-zinc-200 dark:border-zinc-700">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Showing {startIndex + 1}-{Math.min(endIndex, totalPosts)} of {totalPosts} posts
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-10 h-10 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


