'use server';

import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';
import { User, UserRole } from './auth';

// Helper to get cookies in server components
function getServerCookies() {
  const cookieStore = cookies();
  return {
    get: (name: string) => {
      try {
        const cookie = cookieStore.get(name);
        return cookie ? cookie.value : null;
      } catch (error) {
        console.error('Error getting cookie:', error);
        return null;
      }
    }
  };
}

// Server-side auth functions
export async function getServerSession() {
  try {
    const cookieStore = getServerCookies();
    const sessionToken = cookieStore.get('session');
    
    if (!sessionToken) {
      return { user: null };
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionToken, true);
    const userRecord = await adminAuth.getUser(decodedToken.uid);
    
    const isAdmin = userRecord.email === 'rvimman@gmail.com' || 
                   (userRecord.customClaims as any)?.role === UserRole.ADMIN;

    const user: User = {
      uid: userRecord.uid,
      id: userRecord.uid,
      displayName: userRecord.displayName || '',
      name: userRecord.displayName || '',
      email: userRecord.email || '',
      photoURL: userRecord.photoURL || '',
      emailVerified: userRecord.emailVerified || false,
      role: isAdmin ? UserRole.ADMIN : UserRole.USER,
      isAdmin,
    };

    return { user };
  } catch (error) {
    console.error('Error getting server session:', error);
    return { user: null };
  }
}

export async function requireAdmin() {
  const { user } = await getServerSession();
  const isAdmin = user?.isAdmin === true;
  
  if (!user || !isAdmin) {
    return { user: null, isAdmin: false };
  }
  
  return { user, isAdmin: true };
}
