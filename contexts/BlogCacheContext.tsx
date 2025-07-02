import { createContext, useContext, ReactNode } from 'react';
import { PostData } from '@/types';

interface BlogCacheContextType {
  getCachedPost: (id: string) => PostData | null;
  cachePost: (post: PostData) => void;
  clearCache: () => void;
}

const BlogCacheContext = createContext<BlogCacheContextType | undefined>(undefined);

export function BlogCacheProvider({ children }: { children: ReactNode }) {
  const cache = new Map<string, PostData>();

  const getCachedPost = (id: string) => {
    return cache.get(id) || null;
  };

  const cachePost = (post: PostData) => {
    if (post?.id) {
      cache.set(post.id, post);
    }
  };

  const clearCache = () => {
    cache.clear();
  };

  return (
    <BlogCacheContext.Provider value={{ getCachedPost, cachePost, clearCache }}>
      {children}
    </BlogCacheContext.Provider>
  );
}

export const useBlogCache = () => {
  const context = useContext(BlogCacheContext);
  if (context === undefined) {
    throw new Error('useBlogCache must be used within a BlogCacheProvider');
  }
  return context;
};
