export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface Author {
  id: string;
  name: string;
  username?: string;
  photoURL?: string;
  socials?: SocialLinks;
  [key: string]: any; // Allow additional properties
}

export interface PostData {
  id: string;
  title: string;
  content: string;
  htmlContent?: string;
  author: Author;
  // For backward compatibility and easier access
  authorId?: string;
  authorName?: string;
  authorPhotoURL?: string | null;
  authorUsername?: string;
  authorSocials?: SocialLinks;
  
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
