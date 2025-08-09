import { 
  doc, 
  getDoc, 
  onSnapshot, 
  Unsubscribe, 
  DocumentData, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';
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

export interface UserData {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
  twitch?: string;
  reddit?: string;
  stackoverflow?: string;
  createdAt?: {
    toDate?: () => Date;
  } | null;
  toDate?: () => Date;
  providerData?: Array<{
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    [key: string]: any; // Allow additional properties
  }>;
  [key: string]: any; // Allow additional properties
}

export async function getUserByUsername(username: string): Promise<UserData | null> {
  try {
    console.log('🔍 [getUserByUsername] Starting search for username:', username);
    
    // Check if Firestore is initialized
    if (!db) {
      console.error('❌ Firestore is not initialized');
      console.log('Firebase config:', process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
      return null;
    }
    
    // Verify database connection
    console.log('✅ Firestore is initialized');
    console.log('Environment:', process.env.NODE_ENV);
    
    const usersRef = collection(db, 'users');
    console.log('🔍 Using Firestore collection: users');
    
    // Clean and prepare the username for search
    const searchUsername = username.trim();
    console.log('🔍 Cleaned search username:', searchUsername);
    
    // Create a case-insensitive query
    const q = query(usersRef, where('username', '==', searchUsername));
    console.log('🔍 Executing Firestore query for username:', searchUsername);
    
    // Log the query for debugging
    console.log('🔍 Firestore query details:', {
      collection: 'users',
      field: 'username',
      operator: '==',
      value: searchUsername
    });
    
    const querySnapshot = await getDocs(q);
    console.log(`🔍 Query completed. Found ${querySnapshot.size} matching documents.`);
    
    // Log the first few documents for debugging
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      console.log('📄 Document:', {
        id: doc.id,
        exists: doc.exists(),
        data: {
          ...docData,
          // Add any specific fields you want to log
          username: docData.username,
          email: docData.email,
          displayName: docData.displayName
        }
      });
    });
    
    console.log('🔍 Query results:', {
      empty: querySnapshot.empty,
      size: querySnapshot.size,
      docs: querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))
    });
    
    if (querySnapshot.empty) {
      console.log(`❌ No user found with username: ${searchUsername}`);
      return null;
    }
    
    // Get the first matching user
    const userDoc = querySnapshot.docs[0];
    const userData = {
      uid: userDoc.id,
      ...userDoc.data()
    };
    
    console.log('✅ Found user:', userData);
    return userData as UserData;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    const list: UserData[] = [];
    snap.forEach((d) => {
      const data = d.data() as Partial<UserData>;
      list.push({
        uid: d.id,
        displayName: data.displayName ?? null,
        email: data.email ?? null,
        photoURL: data.photoURL ?? null,
        username: data.username ?? '',
        createdAt: data.createdAt ?? null,
        ...data,
      } as UserData);
    });
    return list;
  } catch (e) {
    console.error('Error fetching users:', e);
    return [];
  }
}

export async function getUserData(userId: string, subscribe: boolean = false): Promise<UserData | null> {
  // Check in-memory cache first
  if (userCache.has(userId) && !subscribe) {
    const cachedData = userCache.get(userId);
    if (cachedData) {
      return cachedData as UserData;
    }
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as Partial<UserData>;
      if (!userData) {
        console.error('User data is undefined');
        return null;
      }

      let processedData: UserData = {
        uid: userId,
        displayName: userData.displayName ?? null,
        photoURL: userData.photoURL ?? null,
        email: userData.email ?? null,
        username: userData.username ?? '',
        bio: userData.bio ?? '',
        website: userData.website ?? '',
        location: userData.location ?? '',
        createdAt: userData.createdAt ?? null,
        providerData: Array.isArray(userData.providerData) ? userData.providerData : []
      };
      
      // If we have provider data, merge it with the user data
      if (Array.isArray(userData.providerData) && userData.providerData.length > 0) {
        const providerData = userData.providerData[0];
        if (providerData) {
          processedData = {
            ...processedData,
            displayName: processedData.displayName || providerData.displayName || null,
            photoURL: processedData.photoURL || providerData.photoURL || null,
            email: processedData.email || providerData.email || null
          };
        }
      }
      
      // Update both in-memory and localStorage cache
      userCache.set(userId, processedData);
      saveCache();
      
      // If subscribing, set up real-time updates
      if (subscribe) {
        return new Promise((resolve) => {
          const userDocRef = doc(db, 'users', userId);
          if (!userDocRef) {
            console.error('Failed to create document reference');
            resolve(processedData);
            return;
          }

          const unsubscribe = onSnapshot(userDocRef, (doc) => {
            try {
              if (doc.exists()) {
                const updatedData = doc.data();
                if (!updatedData) {
                  console.error('Updated data is undefined');
                  return;
                }

                let processedUpdatedData: UserData = {
                  uid: userId,
                  displayName: updatedData.displayName ?? null,
                  photoURL: updatedData.photoURL ?? null,
                  email: updatedData.email ?? null,
                  username: updatedData.username ?? '',
                  bio: updatedData.bio ?? '',
                  website: updatedData.website ?? '',
                  location: updatedData.location ?? '',
                  createdAt: updatedData.createdAt ?? null,
                  providerData: Array.isArray(updatedData.providerData) 
                    ? updatedData.providerData 
                    : []
                };
                
                // If we have provider data, merge it with the updated data
                if (Array.isArray(updatedData.providerData) && updatedData.providerData.length > 0) {
                  const providerData = updatedData.providerData[0];
                  if (providerData) {
                    processedUpdatedData = {
                      ...processedUpdatedData,
                      displayName: processedUpdatedData.displayName || providerData.displayName || null,
                      photoURL: processedUpdatedData.photoURL || providerData.photoURL || null,
                      email: processedUpdatedData.email || providerData.email || null
                    };
                  }
                }
                
                userCache.set(userId, processedUpdatedData);
                saveCache();
                
                // Dispatch a custom event to notify about the update
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('userDataUpdated', {
                    detail: { userId, userData: processedUpdatedData }
                  }));
                }
              }
            } catch (error) {
              console.error('Error in onSnapshot callback:', error);
            }
          }, (error) => {
            console.error('Error setting up snapshot listener:', error);
          });
          
          // Store the unsubscribe function
          if (unsubscribe) {
            subscriptions.set(userId, { 
              count: 1, 
              unsubscribe: () => {
                try {
                  unsubscribe();
                } catch (error) {
                  console.error('Error unsubscribing:', error);
                }
                subscriptions.delete(userId);
              } 
            });
          }
          
          resolve(processedData);
        }) as Promise<UserData>;
      }
      
      return processedData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Function to unsubscribe from user updates
export function unsubscribeFromUser(userId: string): void {
  if (!userId) {
    console.error('User ID is required');
    return;
  }

  const sub = subscriptions.get(userId);
  if (!sub) {
    return; // No subscription found for this user
  }

  try {
    sub.count--;
    if (sub.count <= 0) {
      if (typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
      subscriptions.delete(userId);
    }
  } catch (error) {
    console.error(`Error unsubscribing user ${userId}:`, error);
    // Ensure we clean up even if there's an error
    subscriptions.delete(userId);
  }
}

// Function to subscribe to user data updates
export function subscribeToUser(
  userId: string, 
  callback: (userData: UserData | null) => void
): () => void {
  if (!userId) {
    console.error('User ID is required for subscription');
    return () => {}; // Return no-op function if no userId provided
  }

  // Set up a flag to track if the component is still mounted
  let isMounted = true;
  
  // Get initial data
  getUserData(userId, true)
    .then((userData) => {
      if (isMounted) {
        callback(userData);
      }
    })
    .catch((error) => {
      console.error(`Error fetching initial user data for ${userId}:`, error);
      if (isMounted) {
        callback(null);
      }
    });
  
  // Set up event listener for updates
  const handleUpdate = (event: Event) => {
    try {
      const customEvent = event as CustomEvent<{ userId: string; userData: UserData }>;
      const { userId: updatedUserId, userData } = customEvent.detail || {};
      
      if (updatedUserId === userId) {
        callback(userData);
      }
    } catch (error) {
      console.error('Error handling user data update:', error);
    }
  };

  // Add event listener if in browser environment
  if (typeof window !== 'undefined') {
    window.addEventListener('userDataUpdated', handleUpdate as EventListener);
  }
  
  // Return cleanup function
  return () => {
    isMounted = false; // Mark as unmounted
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('userDataUpdated', handleUpdate as EventListener);
    }
    
    // Clean up the subscription
    try {
      if (userId) {
        unsubscribeFromUser(userId);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };
}

// Define a base interface for items that can be enriched with user data
export interface EnrichableItem {
  userId: string;
  [key: string]: any; // Allow any other properties
}

// TypeScript already has CustomEvent defined in lib.dom.d.ts
// No need to redeclare it, just use it directly

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
    const userDataItem = userDataArray[index];
    if (!userDataItem) {
      return acc;
    }
    
    const userData: Record<string, any> = {};
    const providerData = Array.isArray(userDataItem.providerData) ? userDataItem.providerData[0] : null;
    
    fields.forEach(field => {
      // Check the field directly on user data
      if (field in userDataItem && userDataItem[field] !== undefined) {
        userData[field] = userDataItem[field];
      } 
      // Check providerData for Google/Facebook login data
      else if (providerData && field in providerData && providerData[field] !== undefined) {
        userData[field] = providerData[field];
      }
    });
    
    acc[userId] = userData;
    return acc;
  }, {} as Record<string, Record<string, any>>);
  
  // Enrich items with user data and set up subscriptions if needed
  return items.map(item => {
    if (!item.userId) {
      // If no userId is provided, return the item as is with minimal enrichment
      return {
        ...item,
        user: undefined,
        _userUnsubscribe: undefined
      } as T & EnrichedItem<T>;
    }

    // Set up subscription for real-time updates if requested
    let unsubscribe: (() => void) | undefined;
    
    if (subscribe) {
      unsubscribe = subscribeToUser(item.userId, () => {
        // The cache is already updated by the subscription
        // Additional update logic can be added here if needed
      });
    }
    
    // Get user data with fallbacks
    const userData = userDataMap[item.userId] || {};
    
    // Create the enriched item with proper typing
    const enrichedItem: T & EnrichedItem<T> = {
      ...item,
      user: {
        displayName: userData.displayName || userData.name || '',
        photoURL: userData.photoURL || null
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
