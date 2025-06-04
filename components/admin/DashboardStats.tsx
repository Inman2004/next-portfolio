'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Eye, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  description?: string;
}

function StatCard({ title, value, icon, change, description }: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : null;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && description && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {isPositive ? (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={cn(
              isPositive ? 'text-green-500' : 'text-red-500',
              'font-medium'
            )}>
              {Math.abs(change)}%
            </span>{' '}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  // Mock data - replace with real data from your API
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: <Users className="h-4 w-4" />,
      change: 12.5,
      description: 'from last month',
    },
    {
      title: 'Total Posts',
      value: '89',
      icon: <FileText className="h-4 w-4" />,
      change: 5.2,
      description: 'from last month',
    },
    {
      title: 'Total Views',
      value: '12.4K',
      icon: <Eye className="h-4 w-4" />,
      change: 24.1,
      description: 'from last month',
    },
    {
      title: 'Comments',
      value: '342',
      icon: <MessageSquare className="h-4 w-4" />,
      change: -2.3,
      description: 'from last month',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          change={stat.change}
          description={stat.description}
        />
      ))}
    </div>
  );
}
