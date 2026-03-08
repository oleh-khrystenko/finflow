import { Metadata } from 'next';
import { ENV } from '@/shared/config';

const BASE_URL = ENV.NEXT_PUBLIC_BASE_URL;

const PAGE_META: Record<string, { title: string; description: string }> = {
    welcome: {
        title: 'FinFlow – Готовий SaaS-бойлерплейт',
        description:
            'FinFlow – готовий SaaS-бойлерплейт з auth, payments та темами з коробки.',
    },
    billing: {
        title: 'Підписка',
        description: 'Керування підпискою та кредитами FinFlow.',
    },
};

const DEFAULT_TITLE = 'FinFlow';
const DEFAULT_DESCRIPTION =
    'FinFlow – надійний сервіс для захисту та управління вашими ставками.';

interface FetchMetadataOptions {
    page: string | null;
    href: string;
    meta?: { title: string; description: string };
}

export async function fetchMetadata({
    page,
    href,
    meta,
}: FetchMetadataOptions): Promise<Metadata> {
    let title = DEFAULT_TITLE;
    let description = DEFAULT_DESCRIPTION;

    if (meta) {
        title = meta.title;
        description = meta.description;
    } else if (page && PAGE_META[page]) {
        title = PAGE_META[page].title;
        description = PAGE_META[page].description;
    }

    const path = href === 'welcome' ? '' : `/${href}`;

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}${path}`,
        },
    };
}
