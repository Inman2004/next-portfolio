import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
import { NextResponse } from 'next/server';

// Initialize Firebase Admin if not already initialized
const firebaseConfig = process.env.NODE_ENV === 'production' ? {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
} : {
  // Development credentials or mock values
  projectId: 'your-dev-project-id',
  clientEmail: 'dev@example.com',
  privateKey: 'dev-private-key',
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  adapter: process.env.NODE_ENV === 'production' ? FirestoreAdapter({
    credential: cert({
      projectId: firebaseConfig.projectId,
      clientEmail: firebaseConfig.clientEmail,
      privateKey: firebaseConfig.privateKey,
    }),
  }) : undefined,
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('Auth error:', { code, metadata });
    },
    warn(code) {
      console.warn('Auth warning:', code);
    },
    debug(code, metadata) {
      console.debug('Auth debug:', { code, metadata });
    },
  },
});

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as HEAD,
  handler as OPTIONS,
};
