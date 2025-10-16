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
      pathname.startsWith('/dashboard')) {

    try {
      const adminCheckUrl = new URL('/api/auth/check-admin', request.url);
      const response = await fetch(adminCheckUrl, {
        headers: {
          'Cookie': `session=${sessionCookie}`
        }
      });

      if (!response.ok) {
        throw new Error(`Admin check failed with status: ${response.status}`);
      }

      const { isAdmin } = await response.json();

      if (!isAdmin) {
        console.log('User is not admin, redirecting to signin');
        const signInUrl = new URL('/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      console.log('Admin access granted.');
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