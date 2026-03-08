'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import UiFullPageLoader from '@/shared/ui/UiFullPageLoader';
import { useAuthStore } from '@/stores/auth';

interface AuthGuardProps {
    children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/auth/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <UiFullPageLoader />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};

export default AuthGuard;
