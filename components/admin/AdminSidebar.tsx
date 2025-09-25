'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: FileText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden my-14 md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-border bg-background">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl px-4 font-bold text-foreground">Admin</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 ${
                        isActive ? 'text-zinc-500' : 'text-zinc-400 group-hover:text-zinc-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t dark:border-zinc-700 border-zinc-200 p-4">
            <button 
              onClick={async () => {
                try {
                  const { signOut } = await import('@/lib/auth');
                  await signOut();
                  window.location.href = '/';
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
              className="flex items-center w-full text-left text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md p-2"
            >
              <LogOut className="mr-3 h-5 w-5 dark:text-zinc-500 text-zinc-400 group-hover:text-zinc-500" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
