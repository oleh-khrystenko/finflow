import { ReactNode } from 'react';
import localFont from 'next/font/local';
import '@/app/globals.css';
import { Header } from '@/widgets/header';
import { AuthInitializer } from '@/features/auth';
import { Providers } from '@/app/providers';

const mulish = localFont({
    src: [
        {
            path: '../shared/fonts/mulish-cyrillic.woff2',
            style: 'normal',
        },
        {
            path: '../shared/fonts/mulish-latin.woff2',
            style: 'normal',
        },
    ],
    display: 'swap',
});

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="uk" suppressHydrationWarning>
            <head>
                <meta name="darkreader-lock" />
                <meta name="color-scheme" content="light dark" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </head>

            <body
                className={`${mulish.className} bg-background text-text-primary`}
            >
                <Providers>
                    <AuthInitializer />
                    <Header />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
