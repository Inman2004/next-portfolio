import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware triggered for path:', pathname);

  const sessionCookie = request.cookies.get('session')?.value;
  console.log('Session cookie value:', sessionCookie);

  if (!sessionCookie) {
    console.log('No session cookie, redirecting to signin');
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For admin routes, check if user is actually an admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') ||
      pathname.startsWith('/dashboard') || pathname.startsWith('/blog/new') ||
      pathname.startsWith('/blog/edit')) {

    try {
      // Import server auth functions dynamically for edge runtime compatibility
      const { requireAdmin } = await import('./lib/server-auth');

      const { user, isAdmin } = await requireAdmin();

      if (!user || !isAdmin) {
        console.log('User is not admin, redirecting to signin');
        const signInUrl = new URL('/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      console.log('Admin access granted for user:', user.email);
    } catch (error) {
      console.error('Error checking admin status:', error);
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/blog/new',
    '/blog/edit/:path*',
    '/api/admin/:path*',
    '/admin/:path*',
  ],
};