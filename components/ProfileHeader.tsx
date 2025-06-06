import Image from 'next/image';
import { User } from 'firebase/auth';
import Link from 'next/link';

interface ProfileHeaderProps {
  user: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    username?: string;
    bio?: string;
    website?: string;
    location?: string;
    createdAt?: {
      toDate?: () => Date;
    } | null;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const joinDate = user.createdAt?.toDate
    ? new Date(user.createdAt.toDate()).getFullYear()
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 dark:border-gray-700">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || 'User'}
              fill
              className="object-cover"
              sizes="128px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.user-fallback') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 hidden items-center justify-center user-fallback">
            <span className="text-4xl font-bold text-white">
              {user.displayName?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.displayName || 'Anonymous User'}
          </h1>
          
          {user.username && (
            <p className="text-gray-600 dark:text-gray-300">
              @{user.username}
            </p>
          )}
          
          {user.bio && (
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              {user.bio}
            </p>
          )}
          
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
            {user.location && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {user.location}
              </div>
            )}
            
            {user.website && (
              <a 
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            
            {joinDate && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {joinDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
