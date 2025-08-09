'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import type { BlogPost } from '@/types/blog';
import { useAuth } from '@/contexts/AuthContext';

export default function BlogPostsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getBlogPosts();
        if (!mounted) return;
        setPosts(data);
      } catch (e) {
        console.error(e);
        if (mounted) setError('Failed to load posts');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const list = posts || [];
    const q = searchQuery.toLowerCase();
    return list.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const authorName = (p.authorName || (p.author && typeof p.author === 'string' ? p.author : (p.author as any)?.name) || '').toLowerCase();
      const username = (p.authorUsername || p.username || '').toLowerCase();
      return title.includes(q) || authorName.includes(q) || username.includes(q);
    });
  }, [posts, searchQuery]);

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            className="pl-8 w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            )}
            {error && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-red-600">{error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/blog/edit/${post.id}`} className="hover:underline">{post.title}</Link>
                </TableCell>
                <TableCell>{post.authorName || (post.author && typeof post.author === 'string' ? post.author : (post.author as any)?.name) || 'Unknown'}</TableCell>
                <TableCell>{(() => {
                  const d = post.createdAt as any;
                  const date = typeof d?.toDate === 'function' ? d.toDate() : (d instanceof Date ? d : null);
                  return date ? date.toISOString().slice(0,10) : '';
                })()}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell>{(post.viewCount || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/blog/edit/${post.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/blog/${post.slug || post.id}`}>View Live</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-muted-foreground" disabled>
                        Delete (wire server action)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `Showing ${filteredPosts.length} of ${(posts || []).length} posts`}
        </div>
      </div>
    </div>
  );
}
