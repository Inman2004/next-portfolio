'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { User } from 'firebase/auth';
import { format } from 'date-fns';
import { FiGithub, FiTwitter, FiLinkedin, FiGlobe, FiMapPin, FiCalendar, FiMail, FiUser, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { UserData, getUserByUsername, getUserData } from '@/lib/userUtils';
import { BlogPost } from '@/types/blog';
import { UserAvatar } from '@/components/ui/UserAvatar';

// Constants
const POSTS_PER_PAGE = 10;

// Types
type SocialLink = {
  platform: string;
  url: string;
  icon: JSX.Element;
};

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export default function UserProfilePage() {
  // Get the username from the URL params using useParams
  const routeParams = useParams<{ username: string }>();
  const username = routeParams?.username || '';
  const identifier = username; // This can be username or UID
  
  if (!username) {
    // Handle the case where username is not available
    return <div>User not found</div>;
  }
  
  console.log('UserProfilePage - Identifier:', identifier);
  console.log('UserProfilePage - Username from params:', username);
  
  // State management
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Memoize social links
  const socialLinks = useMemo<SocialLink[]>(() => {
    if (!user) return [];
    
    return [
      ...(user.website ? [{
        platform: 'website',
        url: user.website.startsWith('http') ? user.website : `https://${user.website}`,
        icon: <FiGlobe className="w-5 h-5" />
      }] : []),
      ...(user.github ? [{
        platform: 'github',
        url: `https://github.com/${user.github}`,
        icon: <FiGithub className="w-5 h-5" />
      }] : []),
      ...(user.twitter ? [{
        platform: 'twitter',
        url: `https://twitter.com/${user.twitter.replace('@', '')}`,
        icon: <FiTwitter className="w-5 h-5" />
      }] : []),
      ...(user.linkedin ? [{
        platform: 'linkedin',
        url: `https://linkedin.com/in/${user.linkedin}`,
        icon: <FiLinkedin className="w-5 h-5" />
      }] : [])
    ];
  }, [user]);

  // Format join date
  const joinDate = useMemo(() => 
    user?.createdAt?.toDate
      ? format(user.createdAt.toDate(), 'MMMM yyyy')
      : null,
    [user?.createdAt]
  );

  // Fetch user data
  const fetchUserData = useCallback(async (identifier: string) => {
    try {
      console.log('Fetching user data for identifier:', identifier);
      
      // First try to get user by username
      let userData = await getUserByUsername(identifier);
      
      // If not found by username, try to get by UID
      if (!userData) {
        console.log('User not found by username, trying UID...');
        userData = await getUserData(identifier);
      }
      
      console.log('User data result:', userData);
      
      if (!userData) {
        throw new Error(`User not found with identifier: ${identifier}`);
      }
      
      return userData;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while fetching user data');
    }
  }, []);

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (username: string, pageNum: number) => {
    try {
      const apiUrl = `/api/users/${encodeURIComponent(username)}/posts?limit=${POSTS_PER_PAGE}&page=${pageNum}`;
      
      // Get the current user's auth token
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const auth = getAuth();
      
      // Wait for auth state to be determined
      const currentUser = await new Promise<User | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });
      
      // Prepare headers with auth token if user is signed in
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenError) {
          console.error('Error getting auth token:', tokenError);
        }
      }
      
      console.log('Fetching posts from:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        credentials: 'same-origin',
        cache: 'no-store'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to fetch posts');
      }
      
      const data = await response.json();
      console.log('Posts data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Reset states
        setPage(1);
        setHasMore(true);
        
        // Fetch user data
        const userData = await fetchUserData(identifier);
        setUser(userData);
        
        // Try to fetch posts, but don't fail if it doesn't work
        try {
          const postsData = await fetchPosts(identifier, 1);
          setPosts(postsData.posts || []);
          setHasMore(postsData.hasMore || false);
        } catch (postsError) {
          console.warn('Failed to fetch posts, but continuing with user data:', postsError);
          // Check if it's a 404 error (user not found) vs other errors
          if (postsError instanceof Error && postsError.message.includes('User not found')) {
            console.log('User not found in posts API, but user data was loaded successfully');
          }
          setPosts([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error in loadData:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (identifier) {
      loadData();
    } else {
      setError('No user identifier provided');
      setIsLoading(false);
    }
  }, [identifier, fetchUserData, fetchPosts]);
  
  // Handle tab change
  const handleTabChange = (tab: 'posts' | 'about') => {
    setActiveTab(tab);
  };
  
  // Load more posts
  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;
    
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const postsData = await fetchPosts(identifier, nextPage);
      
      setPosts(prev => [...prev, ...postsData.posts]);
      setPage(nextPage);
      setHasMore(postsData.hasMore);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoading(false);
    }
  };
// Add this at the end of your file, after the loadMorePosts function

  // Render loading state
  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Profile</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Render user not found
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The requested user could not be found.</p>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700"></div>
        <div className="px-6 pb-6 relative -mt-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex items-end">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white">
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
                <p className="text-gray-600 dark:text-gray-400">
                  {user.username ? `@${user.username}` : `User ID: ${identifier}`}
                </p>
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
            onClick={() => handleTabChange('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => handleTabChange('about')}
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
        {activeTab === 'about' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About</h2>
            
            {user.bio ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bio</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{user.bio}</p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-500 dark:text-gray-400 italic">No bio provided</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h3>
                <div className="space-y-3">
                  {user.location && (
                    <div className="flex items-start">
                      <FiMapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                        <p className="text-gray-900 dark:text-white">{user.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.website && (
                    <div className="flex items-start">
                      <FiGlobe className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</p>
                        <a 
                          href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {user.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {joinDate && (
                    <div className="flex items-start">
                      <FiCalendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</p>
                        <p className="text-gray-900 dark:text-white">{joinDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {posts.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.views || 0}
                    </p>
                  </div>
                </div>
                
                {socialLinks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Connect</h4>
                    <div className="flex space-x-3">
                      {socialLinks.map((link) => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                          aria-label={link.platform}
                        >
                          <span className="sr-only">{link.platform}</span>
                          {React.cloneElement(link.icon, { className: 'h-6 w-6' })}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'posts' ? (
          <>
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {post.coverImage && (
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        <Link href={`/blog/${post.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {post.createdAt?.toDate 
                            ? format(post.createdAt.toDate(), 'MMM dd, yyyy')
                            : 'Unknown date'
                          }
                        </span>
                        {post.readingTime && (
                          <span>{post.readingTime} min read</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={loadMorePosts}
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Loading...' : 'Load More Posts'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {posts.length === 0 && !isLoading ? 'No posts found.' : 'Loading posts...'}
                </p>
                {posts.length === 0 && !isLoading && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    This user hasn't published any posts yet.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About {user.displayName || 'User'}</h3>
            {user.bio ? (
              <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No bio available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}