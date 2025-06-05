import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You don't have permission to access the admin dashboard. Only the main administrator account
            (rvimman) can access this area.
          </p>
        </div>
        <div className="mt-6">
          <Button asChild className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>If you believe this is a mistake, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
