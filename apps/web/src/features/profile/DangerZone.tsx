'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import UiButton from '@/shared/ui/UiButton';
import { deleteAccount } from '@/shared/api';
import { useAuthStore } from '@/stores/auth';
import DeleteAccountModal from './DeleteAccountModal';

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_SEC = 60;

const DangerZone = () => {
    const router = useRouter();

    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cooldownSec, setCooldownSec] = useState(0);

    useEffect(() => {
        if (cooldownSec <= 0) return;
        const timer = setInterval(() => {
            setCooldownSec((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldownSec]);

    const requestedAt = user?.accountDeletionRequestedAt
        ? new Date(user.accountDeletionRequestedAt)
        : null;
    const isPendingDeletion =
        requestedAt !== null &&
        Date.now() - requestedAt.getTime() < MAGIC_LINK_TTL_MS;

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteAccount();

            if (result.requiresPassword) {
                setShowModal(true);
            } else if (result.requiresMagicLink) {
                if (user) {
                    setUser({
                        ...user,
                        accountDeletionRequestedAt: new Date(),
                    });
                }
                setCooldownSec(RESEND_COOLDOWN_SEC);
                toast.success(
                    'Посилання для підтвердження надіслано на пошту'
                );
            }
        } catch (error) {
            const is429 =
                error instanceof AxiosError && error.response?.status === 429;
            toast.error(
                is429
                    ? 'Забагато запитів. Спробуйте через 15 хвилин'
                    : 'Невірний пароль'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleted = () => {
        setShowModal(false);
        toast.success('Акаунт деактивовано');
        router.push('/auth/signin');
    };

    const resendDisabled = loading || cooldownSec > 0;

    return (
        <section className="space-y-4">
            <h2 className="text-text-primary text-xl font-semibold">
                Небезпечна зона
            </h2>

            <div className="rounded-lg border border-error/30 bg-error/10 p-6">
                <h3 className="text-text-primary font-medium">
                    Видалення акаунту
                </h3>
                <p className="text-text-secondary mt-1 text-sm">
                    Після видалення у вас є 30 днів для відновлення
                    акаунту.
                </p>

                {isPendingDeletion && (
                    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
                        <p className="text-primary text-sm font-medium">
                            Перевірте пошту
                        </p>
                        <p className="text-primary mt-1 text-sm">
                            Посилання для підтвердження видалення акаунту
                            надіслано на вашу адресу. Посилання дійсне 15
                            хвилин.
                        </p>
                    </div>
                )}

                <UiButton
                    variant="filled"
                    size="md"
                    className="mt-4 rounded-lg bg-error"
                    onClick={() => void handleDelete()}
                    disabled={isPendingDeletion ? resendDisabled : loading}
                >
                    {isPendingDeletion
                        ? cooldownSec > 0
                            ? `Надіслати повторно (${cooldownSec}с)`
                            : 'Надіслати повторно'
                        : 'Видалити акаунт'}
                </UiButton>
            </div>

            {showModal && (
                <DeleteAccountModal
                    onClose={() => setShowModal(false)}
                    onDeleted={handleDeleted}
                />
            )}
        </section>
    );
};

export default DangerZone;
