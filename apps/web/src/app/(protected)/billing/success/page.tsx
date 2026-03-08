'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UiFullPageLoader from '@/shared/ui/UiFullPageLoader';
import { getMe } from '@/shared/api';
import { useAuthStore } from '@/stores/auth';

export default function BillingSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const handle = async () => {
            try {
                const user = await getMe();
                useAuthStore.getState().setUser(user);
                toast.success('Підписку оформлено');
            } catch {
                toast.error(
                    'Не вдалося оновити дані. Перезавантажте сторінку.'
                );
            }
            router.replace('/billing');
        };

        void handle();
    }, [router]);

    return <UiFullPageLoader message="Обробка оплати…" />;
}
