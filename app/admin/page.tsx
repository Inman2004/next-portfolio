'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, FileText, Eye, MessageSquare, ArrowRight, Loader2, Briefcase } from 'lucide-react';
import { DashboardStats } from '@/components/admin/DashboardStats';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_EMAIL } from '@/types/blog';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin?callbackUrl=/admin');
    } else if (!loading && user && user.email !== ADMIN_EMAIL) {
      // Redirect to unauthorized if not the admin
      router.push('/unauthorized');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
          <p className="mt-2">You don't have permission to access this page.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      action: 'New user registered',
      details: 'johndoe@example.com',
      time: '2 minutes ago',
      user: 'John Doe',
    },
    {
      id: 2,
      action: 'New blog post published',
      details: 'Getting Started with Next.js',
      time: '1 hour ago',
      user: 'Jane Smith',
    },
    {
      id: 3,
      action: 'Comment on post',
      details: 'Great article! Thanks for sharing.',
      time: '3 hours ago',
      user: 'Bob Johnson',
    },
    {
      id: 4,
      action: 'User profile updated',
      details: 'Changed profile picture',
      time: '5 hours ago',
      user: 'Alice Williams',
    },
    {
      id: 5,
      action: 'New user registered',
      details: 'sarahm@example.com',
      time: '1 day ago',
      user: 'Sarah Miller',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Projects',
      description: 'View, add, edit, or delete projects',
      icon: <FileText className="h-6 w-6 text-emerald-500" />,
      href: '/admin/projects',
    },
    {
      title: 'Manage Experiences',
      description: 'View, add, edit, or delete experiences',
      icon: <Briefcase className="h-5 w-5" />,
      href: '/admin/experiences',
    },
    {
      title: 'Create New Post',
      description: 'Write a new blog post',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/blog/new',
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users',
    },
    {
      title: 'View Analytics',
      description: 'See website traffic and metrics',
      icon: <Eye className="h-5 w-5" />,
      href: '/admin/analytics',
    },
  ];

  return (
    <div className="space-y-6 ml-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild className="bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white dark:text-black">
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {activity.user
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.details}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6 col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 dark:hover:bg-primary/10 dark:hover:text-primary hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <Link href={action.href}>
                    <div className="flex items-center justify-center p-2 mr-3 rounded-lg bg-primary/10 text-primary">
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">System Version</p>
                    <p className="text-sm text-muted-foreground">v1.0.0</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Last Backup</p>
                    <p className="text-sm text-muted-foreground">Today, 2:30 AM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Run Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
