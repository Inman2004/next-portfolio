import { User } from 'firebase/auth';

export async function isAdmin(user: User | null) {
  if (!user || !user.email) return false;
  return user.email === 'rvimman@gmail.com';
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('firebase-auth-token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('firebase-auth-token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('firebase-auth-token');
  }
}
