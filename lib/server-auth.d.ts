import { User, UserRole } from './auth';

declare module './server-auth' {
  export function getServerSession(): Promise<{ user: User | null }>;
  
  export function requireAdmin(): Promise<{
    user: User | null;
    isAdmin: boolean;
  }>;
}
