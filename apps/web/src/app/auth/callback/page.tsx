'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UiButton from '@/shared/ui/UiButton';
import UiFullPageLoader from '@/shared/ui/UiFullPageLoader';
import UiSpinner from '@/shared/ui/UiSpinner';
import { refreshToken, getMe, restoreAccount } from '@/shared/api';
import { useAuthStore } from '@/stores/auth';

export default function CallbackPage() {
    const router = useRouter();

    const [accountDeleted, setAccountDeleted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const isAccountDeleted =
            new URLSearchParams(window.location.search).get(
                'account_deleted'
            ) === 'true';

        const authenticate = async () => {
            try {
                await refreshToken();

                if (isAccountDeleted) {
                    useAuthStore.getState().clearUser();
                    setAccountDeleted(true);
                    return;
                }

                const user = await getMe();
                useAuthStore.getState().setUser(user);
                router.replace('/profile');
            } catch {
                router.replace('/auth/signin');
            }
        };

        void authenticate();
    }, [router]);

    const handleRestore = async () => {
        setSubmitting(true);
        try {
            await restoreAccount();
            toast.success('Акаунт відновлено!');
            const user = await getMe();
            useAuthStore.getState().setUser(user);
            router.replace('/profile');
        } catch {
            setSubmitting(false);
            router.replace('/auth/signin');
        }
    };

    if (accountDeleted) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md space-y-6 text-center">
                    <h1 className="text-text-primary text-3xl font-bold">
                        Акаунт деактивовано
                    </h1>
                    <p className="text-text-secondary">
                        Ваш акаунт заплановано до видалення. Відновіть
                        його, натиснувши кнопку нижче.
                    </p>
                    <UiButton
                        variant="filled"
                        size="lg"
                        className="w-full justify-center rounded-lg"
                        disabled={submitting}
                        onClick={() => void handleRestore()}
                    >
                        {submitting ? (
                            <UiSpinner size="sm" />
                        ) : (
                            'Відновити акаунт'
                        )}
                    </UiButton>
                </div>
            </main>
        );
    }

    return <UiFullPageLoader message="Авторизація…" />;
}
