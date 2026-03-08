import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/profile', '/pay', '/billing'];
const AUTH_PATHS = ['/auth/signin'];
const COOKIE_NAME = 'bid_refresh';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasRefreshCookie = request.cookies.has(COOKIE_NAME);

    const isProtected = PROTECTED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    if (isProtected && !hasRefreshCookie) {
        return NextResponse.redirect(
            new URL('/auth/signin', request.url)
        );
    }

    const isAuthPath = AUTH_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    if (isAuthPath && hasRefreshCookie) {
        return NextResponse.redirect(
            new URL('/profile', request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
