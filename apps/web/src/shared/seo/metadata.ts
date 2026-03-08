import { Metadata } from 'next';
import { ENV } from '@/shared/config';

const BASE_URL = ENV.NEXT_PUBLIC_BASE_URL;

const SITE_NAME = 'FinFlow';
const DEFAULT_TITLE = 'FinFlow';
const DEFAULT_DESCRIPTION =
    'FinFlow — готовий SaaS-бойлерплейт з auth, payments та темами з коробки.';

const PAGE_META: Record<string, { title: string; description: string }> = {
    welcome: {
        title: 'FinFlow — Готовий SaaS-бойлерплейт',
        description: DEFAULT_DESCRIPTION,
    },
    signin: {
        title: 'Вхід — FinFlow',
        description: 'Увійдіть до FinFlow через Google, пароль або magic link.',
    },
    profile: {
        title: 'Профіль — FinFlow',
        description: 'Керування профілем, безпекою та налаштуваннями акаунту.',
    },
    billing: {
        title: 'Підписка — FinFlow',
        description: 'Керування підпискою та кредитами FinFlow.',
    },
};

export const rootMetadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: DEFAULT_TITLE,
        template: '%s',
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'uk_UA',
        siteName: SITE_NAME,
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        url: BASE_URL,
    },
    twitter: {
        card: 'summary',
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
    },
    alternates: {
        canonical: BASE_URL,
    },
};

interface FetchMetadataOptions {
    page: string;
    path?: string;
}

export function fetchMetadata({ page, path }: FetchMetadataOptions): Metadata {
    const meta = PAGE_META[page];
    const title = meta?.title ?? DEFAULT_TITLE;
    const description = meta?.description ?? DEFAULT_DESCRIPTION;
    const url = path ? `${BASE_URL}${path}` : BASE_URL;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
        },
        twitter: {
            title,
            description,
        },
        alternates: {
            canonical: url,
        },
    };
}
