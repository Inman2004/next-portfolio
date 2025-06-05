import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Initialize cache from localStorage if available
const initializeCache = () => {
  if (typeof window === 'undefined') return new Map<string, any>();
  
  try {
    const cached = localStorage.getItem('userCache');
    if (cached) {
      return new Map(JSON.parse(cached));
    }
  } catch (error) {
    console.error('Error reading user cache from localStorage:', error);
  }
  
  return new Map<string, any>();
};

// Global in-memory cache
let userCache = initializeCache();

// Save cache to localStorage
const saveCache = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('userCache', JSON.stringify(Array.from(userCache.entries())));
    } catch (error) {
      console.error('Error saving user cache to localStorage:', error);
    }
  }
};

export async function getUserData(userId: string) {
  // Check in-memory cache first
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Update both in-memory and localStorage cache
      userCache.set(userId, userData);
      saveCache();
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export async function enrichWithUserData<T extends { userId: string }>(
  items: T[],
  fields: string[] = ['displayName', 'photoURL']
): Promise<Array<T & { user?: any }>> {
  if (!items.length) return [];
  
  // Get unique user IDs
  const userIds = [...new Set(items.map(item => item.userId))];
  
  // Fetch all user data in parallel
  const userPromises = userIds.map(userId => getUserData(userId));
  const userDataArray = await Promise.all(userPromises);
  
  // Create a map of user data
  const userDataMap = userIds.reduce((acc, userId, index) => {
    if (userDataArray[index]) {
      const userData: any = {};
      fields.forEach(field => {
        if (userDataArray[index][field] !== undefined) {
          userData[field] = userDataArray[index][field];
        }
      });
      acc[userId] = userData;
    }
    return acc;
  }, {} as Record<string, any>);
  
  // Enrich items with user data
  return items.map(item => ({
    ...item,
    user: userDataMap[item.userId] || {}
  }));
}
