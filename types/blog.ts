import { Timestamp } from 'firebase/firestore';

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorPhotoURL?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  slug?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
}
