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
import { MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { getAllUsers, UserData } from '@/lib/userUtils';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getAllUsers();
        if (!mounted) return;
        setUsers(list);
      } catch (e) {
        console.error(e);
        if (mounted) setError('Failed to load users');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredUsers = useMemo(() => {
    const list = users || [];
    const q = searchQuery.toLowerCase();
    return list.filter((u) =>
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New User
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            )}
            {error && !loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-red-600">{error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && filteredUsers.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">
                  <Link href={`/admin/users/${user.uid}`} className="hover:underline">
                    {user.displayName || user.username || 'Unnamed'}
                  </Link>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{(() => {
                  const d: any = user.createdAt;
                  const date = typeof d?.toDate === 'function' ? d.toDate() : (d instanceof Date ? d : null);
                  return date ? date.toISOString().slice(0,10) : '';
                })()}</TableCell>
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
                        <Link href={`/admin/users/${user.uid}`}>View/Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-muted-foreground" disabled>
                        Delete (wire action)
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
          {loading ? 'Loading...' : `Showing ${filteredUsers.length} of ${(users || []).length} users`}
        </div>
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      </div>
    </div>
  );
}
