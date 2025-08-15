import { Timestamp } from 'firebase/firestore';

export const ADMIN_EMAIL = "rvimman@gmail.com";

export function isBlogPostAdmin(email: string): boolean {
  return email === ADMIN_EMAIL;
}

// Base interface for blog posts without user data
export interface BaseBlogPost {
  id?: string;
  title: string;
  content: string; // Raw content (markdown or plain text)
  htmlContent?: string; // HTML content for rich text
  author: string; // Legacy field, use authorName instead
  authorId: string;
  authorName?: string;
  authorUsername?: string;
  username?: string; // For backward compatibility with existing posts
  authorTitle?: string;
  authorPhotoURL?: string | null;
  // Allow both Firestore Timestamp and JavaScript Date
  // When reading from Firestore, it will be Timestamp
  // When creating/updating, we'll use Date or serverTimestamp()
  createdAt: Timestamp | Date | any; // 'any' to handle serverTimestamp()
  updatedAt?: Timestamp | Date | any; // 'any' to handle serverTimestamp()
  slug?: string;
  excerpt?: string;
  coverImage?: string | null;
  published?: boolean;
  isAdmin?: boolean;
  tags?: string[];
  readingTime?: string;
  viewCount?: number;
  // Membership fields
  isMembersOnly?: boolean;
  membershipTier?: 'free' | 'basic' | 'premium';
  previewContent?: string; // Content shown to non-members
}

// Interface for user data that comes from the users collection
export interface BlogPostUserData {
  displayName?: string;
  photoURL?: string | null;
  socials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    website?: string;
    [key: string]: string | undefined;
  };
}

// Interface for blog posts with user data and subscription management
export interface BlogPost extends BaseBlogPost {
  // User data that comes from the users collection
  user?: BlogPostUserData;
  // Optional unsubscribe function for cleaning up real-time subscriptions
  _userUnsubscribe?: () => void;
}

// Type for the enriched blog post returned by enrichBlogPosts
export interface EnrichedBlogPost extends Omit<BlogPost, 'user'> {
  user: BlogPostUserData;
  username?: string;
  _userUnsubscribe?: () => void;
}

// New interfaces for membership and subscriptions
export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  description: string;
}

export interface UserSubscription {
  userId: string;
  creatorId: string;
  tier: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Timestamp | Date;
  endDate?: Timestamp | Date;
  createdAt: Timestamp | Date;
}

export interface BlogSubscription {
  userId: string;
  blogId: string;
  email: string;
  isActive: boolean;
  createdAt: Timestamp | Date;
  lastNotificationSent?: Timestamp | Date;
}

export interface CreatorProfile {
  userId: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  isCreator: boolean;
  membershipEnabled: boolean;
  membershipTiers: MembershipTier[];
  subscriptionCount: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
