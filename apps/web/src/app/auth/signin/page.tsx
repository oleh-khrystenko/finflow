'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import UiButton from '@/shared/ui/UiButton';
import UiInput from '@/shared/ui/UiInput';
import UiPasswordInput from '@/shared/ui/UiPasswordInput';
import UiSpinner from '@/shared/ui/UiSpinner';
import { GoogleIcon } from '@/shared/icons';
import { ENV } from '@/shared/config';
import {
    checkEmail,
    loginWithPassword,
    sendMagicLink,
    restoreAccount,
    getMe,
    getApiMessage,
} from '@/shared/api';
import { useAuthStore } from '@/stores/auth';

type SigninState =
    | 'email'
    | 'loading'
    | 'password'
    | 'magic-link-sent'
    | 'recovery'
    | 'error';

export default function SigninPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const setUser = useAuthStore((s) => s.setUser);

    const [state, setState] = useState<SigninState>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showMagicLinkSuggestion, setShowMagicLinkSuggestion] =
        useState(false);
    const [deletedAt, setDeletedAt] = useState<string | null>(null);
    const [deletedDaysLeft, setDeletedDaysLeft] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/profile');
        }
    }, [isAuthenticated, router]);

    const handleError = (err: unknown) => {
        const code =
            err instanceof AxiosError
                ? err.response?.data?.error?.code
                : undefined;

        if (code === 'RATE_LIMIT_EXCEEDED') {
            const retryAfter =
                err instanceof AxiosError
                    ? err.response?.headers?.['retry-after']
                    : undefined;
            const minutes = retryAfter
                ? Math.ceil(Number(retryAfter) / 60)
                : 15;
            setErrorMessage(
                `Забагато спроб. Спробуйте через ${minutes} хвилин або скористайтесь посиланням «Забули пароль?»`
            );
        } else if (code) {
            setErrorMessage(getApiMessage(code));
        } else {
            setErrorMessage('Щось пішло не так. Спробуйте ще раз');
        }
    };

    const handleEmailSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setState('loading');
        setErrorMessage('');

        try {
            const { hasPassword, isNewUser } = await checkEmail(email);

            if (hasPassword) {
                setState('password');
            } else {
                const purpose = isNewUser ? 'register' : 'login';
                await sendMagicLink(email, purpose);
                setState('magic-link-sent');
            }
        } catch (err) {
            handleError(err);
            setState('error');
        }
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');

        try {
            const result = await loginWithPassword(email, password);

            if (result.accountDeleted) {
                const deleted = result.user.deletedAt
                    ? new Date(result.user.deletedAt)
                    : new Date();
                const gracePeriodEnd = new Date(deleted);
                gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 30);
                const daysLeft = Math.max(
                    0,
                    Math.ceil(
                        (gracePeriodEnd.getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                    )
                );

                setDeletedAt(deleted.toLocaleDateString('uk-UA'));
                setDeletedDaysLeft(daysLeft);
                setState('recovery');
            } else {
                const me = await getMe();
                setUser(me);
                router.push('/profile');
            }
        } catch (err) {
            setSubmitting(false);
            const code =
                err instanceof AxiosError
                    ? err.response?.data?.error?.code
                    : undefined;

            if (code === 'RATE_LIMIT_EXCEEDED') {
                setShowMagicLinkSuggestion(true);
                handleError(err);
            } else if (code === 'UNAUTHORIZED') {
                setErrorMessage('Невірний email або пароль');
            } else {
                handleError(err);
            }
        }
    };

    const handleForgotPassword = async () => {
        setSubmitting(true);
        try {
            await sendMagicLink(email, 'reset-password');
            toast.success(
                'Якщо акаунт з цією адресою існує, ми надіслали посилання для зміни пароля'
            );
            setState('magic-link-sent');
        } catch {
            toast.success(
                'Якщо акаунт з цією адресою існує, ми надіслали посилання для зміни пароля'
            );
            setState('magic-link-sent');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRestore = async () => {
        setSubmitting(true);
        try {
            await restoreAccount();
            toast.success('Акаунт відновлено!');
            const me = await getMe();
            setUser(me);
            router.push('/profile');
        } catch (err) {
            setSubmitting(false);
            handleError(err);
            setState('error');
        }
    };

    const handleSendMagicLinkFromPassword = async () => {
        setSubmitting(true);
        try {
            await sendMagicLink(email, 'login');
            setState('magic-link-sent');
            setShowMagicLinkSuggestion(false);
        } catch {
            setState('magic-link-sent');
            setShowMagicLinkSuggestion(false);
        } finally {
            setSubmitting(false);
        }
    };

    const goBackToEmail = () => {
        setState('email');
        setPassword('');
        setErrorMessage('');
        setSubmitting(false);
        setShowMagicLinkSuggestion(false);
    };

    // --- Header ---
    const renderHeader = () => (
        <div className="text-center">
            <h1 className="text-text-primary text-3xl font-bold">
                {state === 'recovery'
                    ? 'Акаунт деактивовано'
                    : 'Вхід до FinFlow'}
            </h1>
            {state === 'email' && (
                <p className="text-text-secondary mt-2">
                    Запустіть свій SaaS швидше — auth, payments та теми з
                    коробки
                </p>
            )}
        </div>
    );

    // --- State: email ---
    const renderEmailState = () => (
        <>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
                <UiInput
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    IconLeft={Mail}
                    size="lg"
                />

                <UiButton
                    type="submit"
                    variant="filled"
                    size="lg"
                    className="w-full justify-center rounded-lg"
                    disabled={!email}
                >
                    Продовжити
                </UiButton>
            </form>

            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-text-secondary text-sm">або</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <UiButton
                as="a"
                href={`${ENV.NEXT_PUBLIC_API_URL}/auth/google`}
                variant="filled"
                size="lg"
                className="w-full justify-center gap-3 rounded-lg border border-border bg-surface text-text-primary hover:bg-surface-hover"
                IconLeft={GoogleIcon}
            >
                Увійти через Google
            </UiButton>
        </>
    );

    // --- State: loading ---
    const renderLoadingState = () => (
        <div className="flex justify-center py-8">
            <UiSpinner size="lg" />
        </div>
    );

    // --- State: password ---
    const renderPasswordState = () => (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
                <UiInput
                    type="email"
                    value={email}
                    readOnly
                    IconLeft={Mail}
                    size="lg"
                    className="pr-20"
                />
                <UiButton
                    variant="text"
                    size="sm"
                    onClick={goBackToEmail}
                    className="text-primary absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium hover:underline"
                >
                    Змінити
                </UiButton>
            </div>

            <UiPasswordInput
                placeholder="Введіть пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errorMessage || undefined}
                required
                size="lg"
                autoFocus
            />

            <div className="text-right">
                <UiButton
                    variant="text"
                    size="sm"
                    onClick={handleForgotPassword}
                    disabled={submitting}
                    className="text-primary text-sm font-medium hover:underline"
                >
                    Забули пароль?
                </UiButton>
            </div>

            <UiButton
                type="submit"
                variant="filled"
                size="lg"
                className="w-full justify-center rounded-lg"
                disabled={submitting || !password}
            >
                {submitting ? <UiSpinner size="sm" /> : 'Увійти'}
            </UiButton>

            {showMagicLinkSuggestion && (
                <UiButton
                    type="button"
                    variant="filled"
                    size="lg"
                    className="w-full justify-center rounded-lg border border-border bg-surface text-text-primary hover:bg-surface-hover"
                    disabled={submitting}
                    onClick={handleSendMagicLinkFromPassword}
                    IconLeft={Mail}
                >
                    Увійти через email-посилання
                </UiButton>
            )}
        </form>
    );

    // --- State: magic-link-sent ---
    const renderMagicLinkSentState = () => (
        <div className="space-y-6">
            <div className="rounded-lg border border-success/30 bg-success/10 p-6 text-center">
                <Mail className="mx-auto mb-3 h-10 w-10 text-success" />
                <h2 className="text-text-primary text-lg font-semibold">
                    Перевірте пошту
                </h2>
                <p className="text-text-secondary mt-1 text-sm">
                    {`Ми надіслали посилання на ${email}. Перевірте папку "Вхідні" та натисніть на посилання для входу.`}
                </p>
            </div>

            <UiButton
                variant="text"
                size="sm"
                onClick={goBackToEmail}
                className="text-primary mx-auto block text-sm font-medium hover:underline"
            >
                &larr; Інший email
            </UiButton>
        </div>
    );

    // --- State: recovery ---
    const renderRecoveryState = () => (
        <div className="space-y-4">
            <p className="text-text-secondary text-center">
                {`Ваш акаунт було видалено ${deletedAt ?? ''}. Він буде остаточно видалено через ${deletedDaysLeft} днів.`}
            </p>

            <UiButton
                variant="filled"
                size="lg"
                className="w-full justify-center rounded-lg"
                disabled={submitting}
                onClick={handleRestore}
            >
                {submitting ? (
                    <UiSpinner size="sm" />
                ) : (
                    'Відновити акаунт'
                )}
            </UiButton>

            <UiButton
                variant="text"
                size="lg"
                className="w-full justify-center rounded-lg"
                onClick={goBackToEmail}
            >
                Вийти
            </UiButton>
        </div>
    );

    // --- State: error ---
    const renderErrorState = () => (
        <div className="space-y-4">
            <div className="rounded-lg border border-error/30 bg-error/10 p-6 text-center">
                <p className="text-error text-sm font-medium">
                    {errorMessage ||
                        'Щось пішло не так. Спробуйте ще раз'}
                </p>
            </div>

            <UiButton
                variant="filled"
                size="lg"
                className="w-full justify-center rounded-lg"
                onClick={goBackToEmail}
            >
                Продовжити
            </UiButton>
        </div>
    );

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                {renderHeader()}

                {state === 'email' && renderEmailState()}
                {state === 'loading' && renderLoadingState()}
                {state === 'password' && renderPasswordState()}
                {state === 'magic-link-sent' && renderMagicLinkSentState()}
                {state === 'recovery' && renderRecoveryState()}
                {state === 'error' && renderErrorState()}
            </div>
        </main>
    );
}
