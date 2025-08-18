export interface Author {
  name: string;
  photoURL?: string;
  twitter?: string;
  [key: string]: any;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string | Author;
  tags?: string[] | string;
  category?: string;
  published?: boolean;
  featured?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date;
  readingTime?: string;
  [key: string]: any;
}
