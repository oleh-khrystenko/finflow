import { Metadata } from 'next';
import { fetchMetadata } from '@/shared/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
    return await fetchMetadata({ page: 'welcome', href: 'welcome' });
}

export default function HomePage() {
    return (
        <main className="container flex h-full min-h-screen flex-col justify-center gap-6 py-12">
            <p className="text-text-secondary text-sm tracking-[0.25em] uppercase">
                FinFlow
            </p>
            <h1 className="text-text-primary text-4xl font-semibold">
                FinFlow — ваш готовий SaaS-стартер.
            </h1>
            <p className="text-text-secondary max-w-2xl text-lg">
                Все необхідне для швидкого запуску вашого web-додатка.
            </p>
        </main>
    );
}
