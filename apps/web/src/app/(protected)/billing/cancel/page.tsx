'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UiFullPageLoader from '@/shared/ui/UiFullPageLoader';

export default function BillingCancelPage() {
    const router = useRouter();

    useEffect(() => {
        toast.info('Оплату скасовано');
        router.replace('/billing');
    }, [router]);

    return <UiFullPageLoader message="Обробка оплати…" />;
}
