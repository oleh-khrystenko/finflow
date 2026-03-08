// Mock next/server before importing middleware
const mockRedirect = jest.fn((url: URL) => ({
    status: 307,
    headers: new Map([['location', url.toString()]]),
}));

jest.mock('next/server', () => ({
    NextRequest: jest.fn(),
    NextResponse: {
        redirect: (url: URL) => mockRedirect(url),
        next: () => ({ status: 200, headers: new Map() }),
    },
}));

import middleware, { config } from './middleware';

function createMockRequest(
    pathname: string,
    cookies: Record<string, string> = {}
) {
    const url = `http://localhost:3000${pathname}`;

    return {
        nextUrl: {
            pathname,
        },
        url,
        cookies: {
            has: (name: string) => name in cookies,
            get: (name: string) =>
                name in cookies ? { value: cookies[name] } : undefined,
        },
    } as any;
}

describe('middleware', () => {
    beforeEach(() => {
        mockRedirect.mockClear();
    });

    describe('protected paths', () => {
        it('redirects /profile to signin when no cookie', () => {
            const req = createMockRequest('/profile');
            const response = middleware(req);

            expect(response.status).toBe(307);
            expect(mockRedirect).toHaveBeenCalled();
            const url: URL = mockRedirect.mock.calls[0][0];
            expect(url.pathname).toBe('/auth/signin');
        });

        it('redirects /pay to signin when no cookie', () => {
            const req = createMockRequest('/pay');
            const response = middleware(req);

            expect(response.status).toBe(307);
            const url: URL = mockRedirect.mock.calls[0][0];
            expect(url.pathname).toBe('/auth/signin');
        });

        it('redirects /billing to signin when no cookie', () => {
            const req = createMockRequest('/billing');
            const response = middleware(req);

            expect(response.status).toBe(307);
            const url: URL = mockRedirect.mock.calls[0][0];
            expect(url.pathname).toBe('/auth/signin');
        });

        it('passes through protected path when cookie exists', () => {
            const req = createMockRequest('/profile', {
                bid_refresh: 'some-token',
            });
            const response = middleware(req);

            expect(response.status).toBe(200);
            expect(mockRedirect).not.toHaveBeenCalled();
        });
    });

    describe('auth paths', () => {
        it('redirects /auth/signin to profile when cookie exists', () => {
            const req = createMockRequest('/auth/signin', {
                bid_refresh: 'some-token',
            });
            const response = middleware(req);

            expect(response.status).toBe(307);
            const url: URL = mockRedirect.mock.calls[0][0];
            expect(url.pathname).toBe('/profile');
        });

        it('passes through /auth/signin when no cookie', () => {
            const req = createMockRequest('/auth/signin');
            const response = middleware(req);

            expect(response.status).toBe(200);
        });
    });

    describe('public paths', () => {
        it('passes through public paths', () => {
            const req = createMockRequest('/');
            const response = middleware(req);

            expect(response.status).toBe(200);
        });
    });

    describe('matcher config', () => {
        it('excludes api, _next, and file paths', () => {
            expect(config.matcher).toBe(
                '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
            );
        });
    });
});
