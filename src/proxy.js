import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/chat',
  '/editor',
  '/profile',
  '/project',
  '/workspace',
  '/tools',
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('eduspace_session')?.value;
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret, {
      issuer: 'eduspace-ai',
      audience: 'eduspace-app',
    });
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('eduspace_session');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/editor/:path*',
    '/profile/:path*',
    '/project/:path*',
    '/workspace/:path*',
    '/tools/:path*',
  ],
};
