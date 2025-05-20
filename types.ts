export interface Author {
  id: string;
  name: string;
  photoURL?: string;
}

export interface PostData {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: Author;
  image?: string;
}
