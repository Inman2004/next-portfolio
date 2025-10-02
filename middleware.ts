import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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