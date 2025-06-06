import { doc, getDoc, onSnapshot, Unsubscribe, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import { EnrichedBlogPost } from '@/types/blog';

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
// Track real-time subscriptions
const subscriptions = new Map<string, { count: number; unsubscribe: Unsubscribe }>();

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

export async function getUserData(userId: string, subscribe: boolean = false) {
  // Check in-memory cache first
  if (userCache.has(userId) && !subscribe) {
    return userCache.get(userId);
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      let userData = userDoc.data();
      
      // If we have provider data, merge it with the user data
      if (userData.providerData?.length > 0) {
        const providerData = userData.providerData[0];
        userData = {
          ...userData,
          displayName: userData.displayName || providerData.displayName,
          photoURL: userData.photoURL || providerData.photoURL,
          email: userData.email || providerData.email
        };
      }
      
      // Update both in-memory and localStorage cache
      userCache.set(userId, userData);
      saveCache();
      
      // If subscribing, set up real-time updates
      if (subscribe) {
        return new Promise((resolve) => {
          const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
            if (doc.exists()) {
              let updatedData = doc.data();
              
              // If we have provider data, merge it with the user data
              if (updatedData.providerData?.length > 0) {
                const providerData = updatedData.providerData[0];
                updatedData = {
                  ...updatedData,
                  displayName: updatedData.displayName || providerData.displayName,
                  photoURL: updatedData.photoURL || providerData.photoURL,
                  email: updatedData.email || providerData.email
                };
              }
              
              userCache.set(userId, updatedData);
              saveCache();
              
              // Dispatch a custom event to notify about the update
              window.dispatchEvent(new CustomEvent('userDataUpdated', {
                detail: { userId, userData: updatedData }
              }));
            }
          });
          
          // Store the unsubscribe function
          subscriptions.set(userId, { 
            count: 1, 
            unsubscribe: () => {
              unsubscribe();
              subscriptions.delete(userId);
            } 
          });
          
          resolve(userData);
        });
      }
      
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Function to unsubscribe from user updates
export function unsubscribeFromUser(userId: string) {
  const sub = subscriptions.get(userId);
  if (sub) {
    sub.count--;
    if (sub.count <= 0) {
      sub.unsubscribe();
      subscriptions.delete(userId);
    }
  }
}

// Function to subscribe to user data updates
export function subscribeToUser(userId: string, callback: (userData: any) => void) {
  // Get initial data
  getUserData(userId, true).then(callback);
  
  // Set up event listener for updates
  const handleUpdate = (event: Event) => {
    const { userId: updatedUserId, userData } = (event as CustomEvent).detail;
    if (updatedUserId === userId) {
      callback(userData);
    }
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('userDataUpdated', handleUpdate as EventListener);
  }
  
  // Return cleanup function
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('userDataUpdated', handleUpdate as EventListener);
    }
    unsubscribeFromUser(userId);
  };
}

// Define a base interface for items that can be enriched with user data
export interface EnrichableItem {
  userId: string;
  [key: string]: any; // Allow any other properties
}

// Define the structure of the enriched item
export interface EnrichedItem<T> {
  user?: {
    displayName?: string;
    photoURL?: string | null;
  };
  _userUnsubscribe?: () => void;
  [key: string]: any; // Allow any other properties from T
}

export async function enrichWithUserData<T extends EnrichableItem>(
  items: T[],
  fields: string[] = ['displayName', 'photoURL'],
  subscribe: boolean = false
): Promise<Array<T & EnrichedItem<T>>> {
  if (!items.length) return [];
  
  // Get unique user IDs
  const userIds = [...new Set(items.map(item => item.userId))];
  
  // Fetch all user data in parallel
  const userPromises = userIds.map(userId => getUserData(userId, subscribe));
  const userDataArray = await Promise.all(userPromises);
  
  // Create a map of user data
  const userDataMap = userIds.reduce((acc, userId, index) => {
    if (userDataArray[index]) {
      const userData: any = {};
      fields.forEach(field => {
        // Check both the field name and the providerData for the field
        if (userDataArray[index][field] !== undefined) {
          userData[field] = userDataArray[index][field];
        } else if (userDataArray[index].providerData?.[0]?.[field] !== undefined) {
          // Check providerData for Google/Facebook login data
          userData[field] = userDataArray[index].providerData[0][field];
        }
      });
      acc[userId] = userData;
    }
    return acc;
  }, {} as Record<string, any>);
  
  // Enrich items with user data and set up subscriptions if needed
  return items.map(item => {
    // Set up subscription for real-time updates if requested
    let unsubscribe: (() => void) | undefined;
    
    if (subscribe && item.userId) {
      unsubscribe = subscribeToUser(item.userId, (userData) => {
        // This callback will be called whenever the user data is updated
        // You can handle the update here if needed
        // The cache is already updated by the subscription
      });
    }
    
    // Get user data with fallbacks
    const userData = userDataMap[item.userId] || {};
    
    // Create the enriched item with proper typing
    const enrichedItem: T & EnrichedItem<T> = {
      ...item,
      user: {
        displayName: userData.displayName || userData.name,
        photoURL: userData.photoURL || userData.photoURL
      },
      _userUnsubscribe: unsubscribe
    };
    
    return enrichedItem;
  });
}

// Helper function to clean up user subscriptions
export function cleanupUserSubscriptions<T extends { _userUnsubscribe?: () => void }>(items: T[]) {
  items.forEach(item => {
    if (item._userUnsubscribe) {
      item._userUnsubscribe();
    }
  });
}
