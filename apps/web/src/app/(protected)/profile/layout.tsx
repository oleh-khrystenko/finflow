import { ReactNode } from 'react';
import { Metadata } from 'next';
import { fetchMetadata } from '@/shared/seo/metadata';

export function generateMetadata(): Metadata {
    return fetchMetadata({ page: 'profile', path: '/profile' });
}

export default function ProfileLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
