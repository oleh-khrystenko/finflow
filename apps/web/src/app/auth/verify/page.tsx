'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import { CheckCircle } from 'lucide-react';
import UiButton from '@/shared/ui/UiButton';
import UiFullPageLoader from '@/shared/ui/UiFullPageLoader';
import { verifyMagicLink, getMe, getApiMessage } from '@/shared/api';
import { useAuthStore } from '@/stores/auth';

type VerifyStatus = 'verifying' | 'success' | 'deleted' | 'error';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<VerifyStatus>(
        token ? 'verifying' : 'error'
    );
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) return;

        const verify = async () => {
            try {
                const result = await verifyMagicLink(token);

                switch (result.purpose) {
                    case 'register':
                    case 'login':
                    case 'reset-password': {
                        const user = await getMe();
                        useAuthStore.getState().setUser(user);
                        setStatus('success');
                        router.replace('/profile');
                        break;
                    }

                    case 'delete-account': {
                        setStatus('deleted');
                        break;
                    }

                    default: {
                        const user = await getMe();
                        useAuthStore.getState().setUser(user);
                        setStatus('success');
                        router.replace('/profile');
                    }
                }
            } catch (err) {
                setStatus('error');
                const code =
                    err instanceof AxiosError
                        ? err.response?.data?.error?.code
                        : undefined;
                if (code) {
                    setErrorMessage(getApiMessage(code));
                }
            }
        };

        void verify();
    }, [token, router]);

    if (status === 'deleted') {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
                <CheckCircle className="h-12 w-12 text-success" />
                <p className="text-text-primary text-lg font-semibold">
                    Акаунт видалено
                </p>
                <p className="text-text-secondary max-w-sm text-center text-sm">
                    Ваш акаунт деактивовано. Протягом 30 днів ви можете
                    відновити його — просто увійдіть до системи.
                </p>
                <UiButton
                    as="link"
                    href="/auth/signin"
                    variant="filled"
                    size="md"
                    className="rounded-lg"
                >
                    Увійти
                </UiButton>
            </main>
        );
    }

    if (status === 'error') {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
                <p className="text-text-primary text-lg">
                    Посилання недійсне або прострочене
                </p>
                <p className="text-text-secondary text-sm">
                    {errorMessage ||
                        'Посилання для входу, яке ви використали, більше не дійсне. Будь ласка, запросіть нове.'}
                </p>
                <UiButton
                    as="link"
                    href="/auth/signin"
                    variant="filled"
                    size="md"
                    className="rounded-lg"
                >
                    Спробувати знову
                </UiButton>
            </main>
        );
    }

    return (
        <UiFullPageLoader
            message={
                status === 'success'
                    ? 'Перенаправлення…'
                    : 'Перевіряємо посилання…'
            }
        />
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<UiFullPageLoader />}>
            <VerifyContent />
        </Suspense>
    );
}
