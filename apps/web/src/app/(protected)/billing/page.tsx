'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    PAYMENTS_SUBSCRIPTION_ENABLED,
    PAYMENTS_ONE_OFF_ENABLED,
} from '@/shared/config/env';
import {
    createSubscriptionCheckout,
    createOneOffCheckout,
    createPortalSession,
} from '@/shared/api/payments';
import { useAuthStore } from '@/stores/auth';
import { CREDIT_PACK_CONFIG, type CreditPackCode } from '@finflow/types';
import UiButton from '@/shared/ui/UiButton';
import UiSpinner from '@/shared/ui/UiSpinner';

export default function BillingPage() {
    const user = useAuthStore((s) => s.user);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    if (!user) return null;

    const billing = user.billing;
    const hasActive = billing?.hasActiveSubscription === true;

    const formatDate = (date: Date | string | null) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date instanceof Date ? date : new Date(date));
    };

    const handleSubscriptionCheckout = async () => {
        setLoadingAction('subscribe');
        try {
            const { checkoutUrl } =
                await createSubscriptionCheckout('monthly_usd');
            window.location.assign(checkoutUrl);
        } catch {
            toast.error('Не вдалося створити сесію оплати');
            setLoadingAction(null);
        }
    };

    const handleOneOffCheckout = async (packCode: CreditPackCode) => {
        setLoadingAction(`oneoff_${packCode}`);
        try {
            const { checkoutUrl } = await createOneOffCheckout(packCode);
            window.location.assign(checkoutUrl);
        } catch {
            toast.error(
                'Не вдалося створити сесію оплати. Спробуйте ще раз.'
            );
            setLoadingAction(null);
        }
    };

    const handlePortal = async () => {
        setLoadingAction('portal');
        try {
            const { portalUrl } = await createPortalSession();
            window.location.assign(portalUrl);
        } catch {
            toast.error('Не вдалося відкрити портал керування');
            setLoadingAction(null);
        }
    };

    return (
        <div className="mx-auto max-w-lg space-y-12 px-4 py-12">
            {/* ── Subscription Section ── */}
            {PAYMENTS_SUBSCRIPTION_ENABLED && (
                <section>
                    {!hasActive ? (
                        <>
                            <h2 className="text-text-primary mb-2 text-2xl font-bold">
                                Оформіть підписку
                            </h2>
                            <p className="text-text-secondary mb-6">
                                Відкрийте преміум-можливості для свого
                                продукту.
                            </p>
                            <p className="text-text-primary mb-6 font-medium">
                                План: Monthly
                            </p>
                            <UiButton
                                onClick={handleSubscriptionCheckout}
                                disabled={loadingAction === 'subscribe'}
                            >
                                {loadingAction === 'subscribe' ? (
                                    <UiSpinner size="sm" />
                                ) : (
                                    'Оформити підписку'
                                )}
                            </UiButton>
                        </>
                    ) : (
                        <>
                            <h2 className="text-text-primary mb-6 text-2xl font-bold">
                                Ваша підписка
                            </h2>
                            <div className="mb-6 space-y-2">
                                <p className="text-text-secondary">
                                    {billing?.cancelAtPeriodEnd
                                        ? `Активна до ${formatDate(billing?.currentPeriodEnd ?? null)}`
                                        : 'Активна'}
                                </p>
                                {billing?.planCode && (
                                    <p className="text-text-secondary">
                                        {`План: ${billing.planCode}`}
                                    </p>
                                )}
                                {billing?.currentPeriodEnd &&
                                    !billing?.cancelAtPeriodEnd && (
                                        <p className="text-text-secondary">
                                            {`Наступне списання: ${formatDate(billing.currentPeriodEnd)}`}
                                        </p>
                                    )}
                                {billing?.cancelAtPeriodEnd && (
                                    <p className="text-warning text-sm">
                                        Підписку буде скасовано після
                                        завершення поточного періоду.
                                    </p>
                                )}
                            </div>
                            <UiButton
                                onClick={handlePortal}
                                disabled={loadingAction === 'portal'}
                            >
                                {loadingAction === 'portal' ? (
                                    <UiSpinner size="sm" />
                                ) : (
                                    'Керувати підпискою'
                                )}
                            </UiButton>
                        </>
                    )}
                </section>
            )}

            {/* ── Credits Section (One-Off) ── */}
            {PAYMENTS_ONE_OFF_ENABLED && (
                <section>
                    <h2 className="text-text-primary mb-2 text-2xl font-bold">
                        Кредити
                    </h2>
                    <p className="text-text-secondary mb-6">
                        Придбайте кредити для використання послуг. Кожна
                        дія списує 1 кредит.
                    </p>
                    <p className="text-text-secondary mb-6">
                        {`Поточний баланс: ${user.credits.balance} кр.`}
                    </p>
                    <div className="space-y-3">
                        {(
                            Object.entries(CREDIT_PACK_CONFIG) as [
                                CreditPackCode,
                                { credits: number },
                            ][]
                        ).map(([packCode, pack]) => (
                            <div
                                key={packCode}
                                className="flex items-center justify-between"
                            >
                                <span className="text-text-primary">
                                    {`${pack.credits} кредитів`}
                                </span>
                                <UiButton
                                    onClick={() =>
                                        handleOneOffCheckout(packCode)
                                    }
                                    disabled={
                                        loadingAction ===
                                        `oneoff_${packCode}`
                                    }
                                    variant="text"
                                    size="sm"
                                >
                                    {loadingAction ===
                                    `oneoff_${packCode}` ? (
                                        <UiSpinner size="sm" />
                                    ) : (
                                        'Придбати'
                                    )}
                                </UiButton>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
