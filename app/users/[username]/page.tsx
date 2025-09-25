'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { User } from 'firebase/auth';
import { format } from 'date-fns';
import { FiGithub, FiTwitter, FiLinkedin, FiGlobe, FiMapPin, FiCalendar, FiMail, FiUser, FiClock, FiSettings, FiEdit3 } from 'react-icons/fi';
import Link from 'next/link';
import { UserData, getUserByUsername, getUserData } from '@/lib/userUtils';
import { BlogPost } from '@/types/blog';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from '@/components/ui/ProfileSettings';
import { SocialLinksForm } from '@/components/profile/SocialLinksForm';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user: currentUser } = useAuth(); // Get current authenticated user
  
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
  
  // Check if this is the current user's own profile
  const isOwnProfile = useMemo(() => {
    if (!currentUser || !user) return false;
    return currentUser.uid === user.uid || 
           (currentUser.username && currentUser.username === user.username);
  }, [currentUser, user]);

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
  const handleTabChange = (tab: 'posts' | 'about' | 'settings') => {
    setActiveTab(tab as 'posts' | 'about');
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
          <p className="text-zinc-700 dark:text-zinc-300 mb-6">{error}</p>
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
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">User Not Found</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">The requested user could not be found.</p>
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
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700"></div>
        <div className="px-6 pb-6 relative -mt-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex items-end">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-zinc-800 overflow-hidden bg-white">
                <UserAvatar 
                  photoURL={user.photoURL} 
                  displayName={user.displayName}
                  size={128}
                />
              </div>
              <div className="ml-6 mb-2">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {user.displayName || 'Anonymous User'}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
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
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
                  aria-label={link.platform}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-zinc-700 dark:text-zinc-300">
              {user.bio}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
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
      <div className="mb-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className={`grid w-full ${isOwnProfile ? 'grid-cols-3' : 'grid-cols-2'} max-w-md mb-6`}>
            <TabsTrigger 
              value="posts" 
              onClick={() => handleTabChange('posts')}
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              onClick={() => handleTabChange('about')}
            >
              About
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger 
                value="settings" 
                onClick={() => handleTabChange('settings')}
              >
                <FiSettings className="w-4 h-4 mr-1" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="about" className="space-y-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">About</h2>
                {isOwnProfile && (
                  <Button variant="outline" size="sm">
                    <FiEdit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

            
            {user.bio ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Bio</h3>
                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{user.bio}</p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-zinc-500 dark:text-zinc-400 italic">No bio provided</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Details</h3>
                <div className="space-y-3">
                  {user.location && (
                    <div className="flex items-start">
                      <FiMapPin className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</p>
                        <p className="text-zinc-900 dark:text-white">{user.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.website && (
                    <div className="flex items-start">
                      <FiGlobe className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Website</p>
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
                      <FiCalendar className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Joined</p>
                        <p className="text-zinc-900 dark:text-white">{joinDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Posts</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {posts.length}
                    </p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Views</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {user.views || 0}
                    </p>
                  </div>
                </div>
                
                {socialLinks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Connect</h4>
                    <div className="flex space-x-3">
                      {socialLinks.map((link) => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
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
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
                    {post.coverImage && (
                      <div className="h-48 bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                        <Link href={`/blog/${post.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt && (
                        <p className="text-zinc-600 dark:text-zinc-300 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
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
                <p className="text-zinc-500 dark:text-zinc-400">
                  {posts.length === 0 && !isLoading ? 'No posts found.' : 'Loading posts...'}
                </p>
                {posts.length === 0 && !isLoading && (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                    This user hasn't published any posts yet.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your profile information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileSettings />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>
                    Manage your social media links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SocialLinksForm 
                    initialData={currentUser?.socials || {}}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Email</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {currentUser?.email}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Account Created</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {currentUser?.metadata?.creationTime ? 
                        new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'
                      }
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Button variant="destructive">Delete Account</Button>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

        </Tabs>
      </div>
    </div>
  );
}