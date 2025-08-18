import 'server-only';
import { db } from './firebase-server';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  UserSubscription, 
  BlogSubscription, 
  CreatorProfile, 
  MembershipTier 
} from '@/types/blog';

/**
 * Check if a user has an active subscription to a creator
 */
export async function checkUserSubscription(
  userId: string, 
  creatorId: string
): Promise<UserSubscription | null> {
  try {
    const subscriptionsRef = collection(db, 'userSubscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('creatorId', '==', creatorId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const subscription = snapshot.docs[0].data() as UserSubscription;
    return {
      ...subscription,
      id: snapshot.docs[0].id
    };
  } catch (error) {
    console.error('Error checking user subscription:', error);
    return null;
  }
}

/**
 * Get all active subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  try {
    const subscriptionsRef = collection(db, 'userSubscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as UserSubscription[];
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return [];
  }
}

/**
 * Subscribe a user to a creator's membership
 */
export async function subscribeToCreator(
  userId: string,
  creatorId: string,
  tier: string
): Promise<boolean> {
  try {
    // Check if subscription already exists
    const existingSubscription = await checkUserSubscription(userId, creatorId);
    
    if (existingSubscription) {
      // Update existing subscription
      const subscriptionRef = doc(db, 'userSubscriptions', existingSubscription.id);
      await updateDoc(subscriptionRef, {
        tier,
        status: 'active',
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new subscription
      const subscriptionData: Omit<UserSubscription, 'id'> = {
        userId,
        creatorId,
        tier,
        status: 'active',
        startDate: serverTimestamp() as any,
        createdAt: serverTimestamp() as any
      };
      
      await addDoc(collection(db, 'userSubscriptions'), subscriptionData);
    }
    
    // Update creator's subscription count
    await updateCreatorSubscriptionCount(creatorId);
    
    return true;
  } catch (error) {
    console.error('Error subscribing to creator:', error);
    return false;
  }
}

/**
 * Cancel a user's subscription to a creator
 */
export async function cancelSubscription(
  userId: string,
  creatorId: string
): Promise<boolean> {
  try {
    const subscriptionsRef = collection(db, 'userSubscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('creatorId', '==', creatorId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    
    const subscriptionRef = doc(db, 'userSubscriptions', snapshot.docs[0].id);
    await updateDoc(subscriptionRef, {
      status: 'cancelled',
      endDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update creator's subscription count
    await updateCreatorSubscriptionCount(creatorId);
    
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
}

/**
 * Update creator's subscription count
 */
async function updateCreatorSubscriptionCount(creatorId: string): Promise<void> {
  try {
    const activeSubscriptions = await getDocs(
      query(
        collection(db, 'userSubscriptions'),
        where('creatorId', '==', creatorId),
        where('status', '==', 'active')
      )
    );
    
    const creatorRef = doc(db, 'creatorProfiles', creatorId);
    await updateDoc(creatorRef, {
      subscriptionCount: activeSubscriptions.size,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating creator subscription count:', error);
  }
}

/**
 * Get creator profile
 */
export async function getCreatorProfile(creatorId: string): Promise<CreatorProfile | null> {
  try {
    const creatorRef = doc(db, 'creatorProfiles', creatorId);
    const creatorDoc = await getDoc(creatorRef);
    
    if (!creatorDoc.exists()) return null;
    
    return {
      ...creatorDoc.data(),
      id: creatorDoc.id
    } as CreatorProfile;
  } catch (error) {
    console.error('Error getting creator profile:', error);
    return null;
  }
}

/**
 * Create or update creator profile
 */
export async function upsertCreatorProfile(
  creatorId: string,
  profileData: Partial<CreatorProfile>
): Promise<boolean> {
  try {
    const creatorRef = doc(db, 'creatorProfiles', creatorId);
    const existingProfile = await getDoc(creatorRef);
    
    if (existingProfile.exists()) {
      await updateDoc(creatorRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(creatorRef, {
        userId: creatorId,
        isCreator: true,
        membershipEnabled: false,
        membershipTiers: [],
        subscriptionCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...profileData
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error upserting creator profile:', error);
    return false;
  }
}

/**
 * Subscribe to blog notifications
 */
export async function subscribeToBlog(
  userId: string,
  blogId: string,
  email: string
): Promise<boolean> {
  try {
    // Check if subscription already exists
    const subscriptionsRef = collection(db, 'blogSubscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('blogId', '==', blogId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Create new subscription
      const subscriptionData: Omit<BlogSubscription, 'id'> = {
        userId,
        blogId,
        email,
        isActive: true,
        createdAt: serverTimestamp() as any
      };
      
      await addDoc(collection(db, 'blogSubscriptions'), subscriptionData);
    } else {
      // Update existing subscription
      const subscriptionRef = doc(db, 'blogSubscriptions', snapshot.docs[0].id);
      await updateDoc(subscriptionRef, {
        email,
        isActive: true,
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error subscribing to blog:', error);
    return false;
  }
}

/**
 * Unsubscribe from blog notifications
 */
export async function unsubscribeFromBlog(
  userId: string,
  blogId: string
): Promise<boolean> {
  try {
    const subscriptionsRef = collection(db, 'blogSubscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('blogId', '==', blogId)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    
    const subscriptionRef = doc(db, 'blogSubscriptions', snapshot.docs[0].id);
    await updateDoc(subscriptionRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from blog:', error);
    return false;
  }
}

/**
 * Get all blog subscribers for a creator
 */
export async function getBlogSubscribers(blogId: string): Promise<BlogSubscription[]> {
  try {
    const subscriptionsRef = collection(db, 'blogSubscriptions');
    const q = query(
      subscriptionsRef,
      where('blogId', '==', blogId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as BlogSubscription[];
  } catch (error) {
    console.error('Error getting blog subscribers:', error);
    return [];
  }
}

/**
 * Check if user can access member-only content
 */
export async function canAccessMemberContent(
  userId: string,
  creatorId: string
): Promise<boolean> {
  try {
    // If user is the creator, they can access all content
    if (userId === creatorId) return true;
    
    // Check if user has active subscription
    const subscription = await checkUserSubscription(userId, creatorId);
    return !!subscription;
  } catch (error) {
    console.error('Error checking member access:', error);
    return false;
  }
}
