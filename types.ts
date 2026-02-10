
export type AuthView = 'login' | 'signup';

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Post {
  id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}
