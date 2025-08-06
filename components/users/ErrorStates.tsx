import Link from 'next/link';

interface ErrorStatesProps {
  error: string;
}

export function UserNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The user you're looking for doesn't exist or may have been removed.
        </p>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
          <Link 
            href="/blog" 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Browse Blog
          </Link>
        </div>
      </div>
    </div>
  );
}

export function GenericError({ error }: ErrorStatesProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded mb-6" role="alert">
          <p className="font-bold">Error Loading Profile</p>
          <p className="mb-2">We couldn't load the profile data. Please try again later.</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
              <summary className="cursor-pointer font-medium">Show technical details</summary>
              <pre className="mt-2 p-2 bg-white dark:bg-gray-800 rounded overflow-auto max-h-40 text-left">
                {error}
              </pre>
            </details>
          )}
        </div>
        <Link 
          href="/" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
