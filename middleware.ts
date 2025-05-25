import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // If there's a token, the user is authenticated
        return !!token;
      },
    },
    pages: {
      signIn: '/signin',
    },
  }
);

// Protect specific routes
export const config = {
  matcher: [
    '/blog/new',
    '/blog/:path*/edit',
    // Add other protected routes here
  ],
};
