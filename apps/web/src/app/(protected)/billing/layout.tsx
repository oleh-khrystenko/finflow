import { ReactNode } from 'react';
import { Metadata } from 'next';
import { fetchMetadata } from '@/shared/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
    return await fetchMetadata({ page: 'billing', href: 'billing' });
}

export default function BillingLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
