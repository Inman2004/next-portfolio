'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useParams } from 'next/navigation';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { FiGithub, FiTwitter, FiLinkedin, FiGlobe, FiCalendar, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/UserAvatar';
import MarkdownViewer from '@/components/blog/MarkdownViewer';

// Types
import { BlogPost } from '@/types/blog';
import { UserData, getUserByUsername } from '@/lib/userUtils';
import { db } from '@/lib/firebase';
import Quotes from '@/components/Quotes';

// Define BlogCard component props
interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

// Define BlogCard component
const BlogCard = ({ post, className = '' }: BlogCardProps) => {
  // Get excerpt or first 200 characters of content
  const excerpt = post.excerpt || (post.content ? post.content.substring(0, 200) : '');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
      {post.coverImage && (
        <div className="h-48 overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {post.title}
        </h3>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          <MarkdownViewer content={excerpt + (excerpt.length === 200 ? '...' : '')} />
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>{format(new Date(post.createdAt || new Date()), 'MMM d, yyyy')}</span>
          <Link href={`/blog/${post.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
};

// Define ProfileTabs props
interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Define ProfileTabs component
const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => (
  <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
    <nav className="-mb-px flex space-x-8">
      <button
        onClick={() => onTabChange('posts')}
        className={`py-4 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'posts'
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        Posts
      </button>
      <button
        onClick={() => onTabChange('about')}
        className={`py-4 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'about'
            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        About
      </button>
    </nav>
  </div>
);

// Loading component
function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  );
}

// Social link type
interface SocialLink {
  platform: string;
  url: string;
  icon: JSX.Element;
}

type UserProfilePageParams = {
  username: string | string[];
};

export default function UserProfilePage() {
  const params = useParams<{ username: string | string[] }>();
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Early return if params or username is not available
    if (!params?.username) {
      setError('Invalid username');
      setIsLoading(false);
      return;
    }
    
    const username = Array.isArray(params.username) ? params.username[0] : params.username;
    console.log('🔍 [UserProfilePage] Fetching user with username:', username);
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 [UserProfile] Fetching user data for username:', username);
        
        // Fetch user data
        const userData = await getUserByUsername(username);
        console.log('📝 [UserProfile] User data received:', userData ? 'Found user' : 'User not found');
        
        if (!userData) {
          throw new Error(`User not found with username: ${username}`);
        }
        
        console.log('👤 [UserProfile] Setting user data:', {
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          email: userData.email,
          providerData: userData.providerData
        });
        setUser(userData);

        // Fetch user's blog posts through API route using username
        const apiUrl = `/api/users/${encodeURIComponent(username as string)}/posts`;
        console.log('🔗 [UserProfile] Fetching posts from API:', apiUrl);
        
        // Get the current user's auth token
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const auth = getAuth();
        
        // Wait for auth state to be determined
        const currentUser = await new Promise<User | null>((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Unsubscribe immediately after getting the user
            resolve(user);
          });
        });
        
        console.log('🔑 [UserProfile] Current auth state:', currentUser ? 'Authenticated' : 'Not authenticated');
        
        // Prepare headers with auth token if user is signed in
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (currentUser) {
          try {
            const token = await currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
            console.log('🔑 [UserProfile] Added auth token to request');
          } catch (tokenError) {
            console.error('❌ [UserProfile] Error getting auth token:', tokenError);
            // Continue without token if there's an error getting it
          }
        } else {
          console.log('⚠️ [UserProfile] No authenticated user, making unauthenticated request');
        }
        
        console.log('🌐 [UserProfile] Making request to:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
          credentials: 'same-origin' // Include cookies if any
        }).catch((fetchError) => {
          console.error('❌ [UserProfile] Fetch error:', fetchError);
          throw new Error('Network error. Please check your connection and try again.');
        });
        
        // Handle non-JSON responses
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json().catch(() => ({}));
        } else {
          const text = await response.text();
          console.error('❌ [UserProfile] Non-JSON response:', text);
          throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
          console.error('❌ [UserProfile] API Error:', { 
            status: response.status, 
            statusText: response.statusText,
            error: responseData,
            url: response.url 
          });
          
          // Handle specific error codes
          if (response.status === 401 || response.status === 403) {
            throw new Error('You need to be signed in to view this profile. Please sign in and try again.');
          }
          
          // Handle 404 specifically
          if (response.status === 404) {
            throw new Error('User not found');
          }
          
          // Handle 500 errors
          if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          }
          
          // Fallback to the error message from the API if available
          const errorMessage = responseData?.message || 'Failed to load user data';
          throw new Error(errorMessage);
        }
        
        const postsData = (responseData.posts || []).map((post: any) => {
          try {
            return {
              ...post,
              createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
              updatedAt: post.updatedAt ? new Date(post.updatedAt) : null,
            };
          } catch (dateError) {
            console.error('❌ [UserProfile] Error parsing post dates:', dateError, post);
            return {
              ...post,
              createdAt: new Date(),
              updatedAt: null,
            };
          }
        }) as BlogPost[];
        
        console.log(`📝 [UserProfile] Successfully loaded ${postsData.length} posts`);
        setPosts(postsData);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('❌ [UserProfile] Error:', {
          error,
          message: errorMessage,
          username
        });
        setError(`Failed to load profile: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params?.username]); // Only re-run if username changes

  // Format join date
  const joinDate = user?.createdAt?.toDate
    ? format(user.createdAt.toDate(), 'MMMM yyyy')
    : null;

  // Social links
  const socialLinks: SocialLink[] = [
    ...(user?.website ? [{
      platform: 'website',
      url: user.website.startsWith('http') ? user.website : `https://${user.website}`,
      icon: <FiGlobe className="w-5 h-5" />
    }] : []),
    ...(user?.github ? [{
      platform: 'github',
      url: `https://github.com/${user.github}`,
      icon: <FiGithub className="w-5 h-5" />
    }] : []),
    ...(user?.twitter ? [{
      platform: 'twitter',
      url: `https://twitter.com/${user.twitter.replace('@', '')}`,
      icon: <FiTwitter className="w-5 h-5" />
    }] : []),
    ...(user?.linkedin ? [{
      platform: 'linkedin',
      url: `https://linkedin.com/in/${user.linkedin}`,
      icon: <FiLinkedin className="w-5 h-5" />
    }] : []),
  ];

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (error) {
    // Check if the error is specifically for user not found
    const isUserNotFound = error.toLowerCase().includes('user not found');
    
    if (isUserNotFound) {
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

    // For other types of errors, show a generic error message
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The requested user could not be found.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8 my-12">
        <div className="bg-gradient-to-r from-blue-500/50 to-purple-600/50 dark:from-blue-500/50 dark:to-purple-600/50 h-32">
          <Quotes />
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex items-end -mt-16">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
                <UserAvatar 
                  photoURL={user.photoURL} 
                  displayName={user.displayName}
                  size={128}
                />
              </div>
              <div className="ml-6 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.displayName || 'Anonymous User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  aria-label={link.platform}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              {user.bio}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
            {user.location && (
              <div className="flex items-center">
                <FiMapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
                <span>{user.location}</span>
              </div>
            )}
            {joinDate && (
              <div className="flex items-center">
                <FiCalendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
                <span>Joined {joinDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'about'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            About
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'posts' ? (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <BlogCard key={post.id} post={post} className="hover:shadow-lg transition-shadow" />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About {user.displayName || 'User'}</h2>
            {user.bio ? (
              <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No additional information available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Metadata generation has been moved to metadata.ts

export const dynamic = 'error';
export const dynamicParams = true;
