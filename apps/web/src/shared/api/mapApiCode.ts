const MESSAGES: Record<string, string> = {
    // Success
    MAGIC_LINK_SENT: 'Посилання надіслано на вашу пошту',
    LOGGED_OUT: 'Ви вийшли з акаунту',
    ACCOUNT_DELETED: 'Акаунт видалено',
    // Auth errors
    UNAUTHORIZED: 'Час сесії вичерпано. Увійдіть знову',
    INVALID_MAGIC_LINK: 'Посилання недійсне або прострочене',
    // Payments errors
    ALREADY_SUBSCRIBED: 'У вас вже є активна підписка.',
    SUBSCRIPTION_REQUIRED: 'Для доступу потрібна активна підписка.',
    NO_BILLING_ACCOUNT:
        'Платіжний акаунт не знайдено. Оформіть підписку.',
    // Generic errors
    VALIDATION_ERROR: 'Перевірте введені дані',
    RATE_LIMIT_EXCEEDED: 'Забагато запитів. Спробуйте через 15 хвилин',
    INTERNAL_ERROR: 'Сталася помилка. Спробуйте пізніше',
    NOT_FOUND: 'Сторінку не знайдено',
};

const FALLBACK = 'Сталася помилка. Спробуйте пізніше';

export function getApiMessage(code: string): string {
    return MESSAGES[code] ?? FALLBACK;
}
