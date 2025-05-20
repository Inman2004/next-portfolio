import { Timestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "rvimman@gmail.com";

export function isBlogPostAdmin(email: string): boolean {
  return email === ADMIN_EMAIL;
}

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorPhotoURL?: string | null;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  slug?: string;
  excerpt?: string;
  coverImage?: string | null;
  published?: boolean;
  isAdmin?: boolean;
}
