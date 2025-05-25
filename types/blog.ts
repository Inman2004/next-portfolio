import { Timestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "rvimman@gmail.com";

export function isBlogPostAdmin(email: string): boolean {
  return email === ADMIN_EMAIL;
}

export interface BlogPost {
  id?: string;
  title: string;
  content: string; // Raw content (markdown or plain text)
  htmlContent?: string; // HTML content for rich text
  author: string;
  authorId: string;
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
}
