import { ReactNode } from 'react';
import { Metadata } from 'next';
import { fetchMetadata } from '@/shared/seo/metadata';

export function generateMetadata(): Metadata {
    return fetchMetadata({ page: 'signin', path: '/auth/signin' });
}

export default function SigninLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
