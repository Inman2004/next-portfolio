import { Metadata } from 'next';
import { getUserByUsername } from '@/lib/userUtils';

export async function generateMetadata({ 
  params 
}: { 
  params: { username: string } 
}): Promise<Metadata> {
  try {
    const user = await getUserByUsername(params.username);
    
    if (!user) {
      return {
        title: 'User Not Found',
        description: 'The requested user could not be found.'
      };
    }

    return {
      title: `${user.displayName || user.username || 'User'} Profile`,
      description: user.bio || `Profile page of ${user.displayName || user.username || 'the user'}`,
      openGraph: {
        title: `${user.displayName || user.username || 'User'} Profile`,
        description: user.bio || `Profile page of ${user.displayName || user.username || 'the user'}`,
        type: 'profile',
        images: user.photoURL ? [user.photoURL] : [],
      },
      twitter: {
        card: 'summary',
        title: `${user.displayName || user.username || 'User'} Profile`,
        description: user.bio || `Profile page of ${user.displayName || user.username || 'the user'}`,
        images: user.photoURL ? [user.photoURL] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the profile.'
    };
  }
}
