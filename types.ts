export interface Author {
  id: string;
  name: string;
  photoURL?: string;
}

export interface PostData {
  id: string;
  title: string;
  content: string;
  htmlContent?: string;
  author: Author;
  createdAt: Date | { toDate: () => Date };
  updatedAt?: Date | { toDate: () => Date };
  excerpt?: string;
  coverImage?: string | null;
  published?: boolean;
  isAdmin?: boolean;
  tags?: string[];
  // Keep image for backward compatibility
  image?: string;
}
