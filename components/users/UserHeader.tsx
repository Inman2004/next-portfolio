import Image from 'next/image';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { UserAvatar } from '../ui/UserAvatar';
import { UserData } from '@/lib/userUtils';

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

interface UserHeaderProps {
  user: UserData;
  socialLinks: SocialLink[];
  joinDate: string | null;
}

export function UserHeader({ user, socialLinks, joinDate }: UserHeaderProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden mb-8 my-12">
        <div className="bg-gradient-to-r from-emerald-500/50 to-purple-600/50 dark:from-emerald-500/50 dark:to-purple-600/50 h-32">
          {/* Cover photo could go here */}
        </div>
        <div className="px-6 pb-6 -mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-zinc-800 bg-white dark:bg-zinc-700 overflow-hidden">
                <UserAvatar
                  photoURL={user.photoURL || ''}
                  displayName={user.displayName || 'User'}
                  size={128}
                  className="h-full w-full"
                  title={user.displayName || 'User'}
                />
              </div>
              <div className="ml-6 mb-2">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {user.displayName}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-300">@{user.username}</p>
              </div>
            </div>
            
            {/* Follow/Edit Profile Button */}
            <div className="mt-4 sm:mt-0">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                Follow
              </button>
            </div>
          </div>
          
          {/* Bio */}
          {user.bio && (
            <div className="mt-4">
              <p className="text-zinc-700 dark:text-zinc-300">{user.bio}</p>
            </div>
          )}
          
          {/* User Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            {user.location && (
              <div className="flex items-center">
                <FiMapPin className="mr-1" />
                <span>{user.location}</span>
              </div>
            )}
            
            {joinDate && (
              <div className="flex items-center">
                <FiCalendar className="mr-1" />
                <span>Joined {joinDate}</span>
              </div>
            )}
          </div>
          
          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                  aria-label={link.platform}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
