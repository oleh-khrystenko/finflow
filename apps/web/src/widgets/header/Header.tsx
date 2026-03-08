'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { LogOut } from 'lucide-react';

const ChangeTheme = dynamic(() => import('@/features/change-theme'), {
    ssr: false,
});
import { Logo } from '@/entities/brand';
import UiButton from '@/shared/ui/UiButton';
import { logout } from '@/shared/api';
import { useAuthStore } from '@/stores/auth';

const Header = () => {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);
    const clearUser = useAuthStore((s) => s.clearUser);

    const handleLogout = async () => {
        await logout();
        clearUser();
        window.location.assign('/');
    };

    return (
        <header className="bg-background sticky top-0 z-50 shadow-sm">
            <div className="container flex items-center justify-between gap-6 py-4">
                <UiButton
                    as="link"
                    href="/"
                    variant="text"
                    size="md"
                    aria-label="Go to home page"
                    className="p-0"
                >
                    <Logo />
                </UiButton>

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="bg-surface-hover h-8 w-20 animate-pulse rounded-lg" />
                    ) : isAuthenticated && user ? (
                        <>
                            <UiButton
                                as="link"
                                href="/profile"
                                variant="text"
                                size="sm"
                                className="flex items-center gap-2 p-0 transition-opacity hover:opacity-80"
                            >
                                <span className="flex items-center gap-3">
                                    {user.profile.avatar ? (
                                        <Image
                                            src={user.profile.avatar}
                                            alt={user.profile.name || ''}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="bg-surface-hover text-text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                                            {(user.profile.name ||
                                                user.email)[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-text-primary hidden text-sm sm:block">
                                        {user.profile.name || user.email}
                                    </span>
                                    <span className="bg-surface-hover text-text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                        {user.credits.balance} кредитів
                                    </span>
                                </span>
                            </UiButton>
                            <UiButton
                                variant="icon-compact"
                                size="sm"
                                onClick={() => {
                                    void handleLogout();
                                }}
                                aria-label="Вийти"
                                IconLeft={LogOut}
                            />
                        </>
                    ) : (
                        <UiButton
                            as="link"
                            href="/auth/signin"
                            variant="filled"
                            size="sm"
                            className="rounded-lg"
                        >
                            Увійти
                        </UiButton>
                    )}

                    <ChangeTheme />
                </div>
            </div>
        </header>
    );
};

export default Header;
