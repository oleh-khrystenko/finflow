import { getApiMessage } from './mapApiCode';

describe('getApiMessage', () => {
    it('returns Ukrainian message for success codes', () => {
        expect(getApiMessage('MAGIC_LINK_SENT')).toBe(
            'Посилання надіслано на вашу пошту'
        );
        expect(getApiMessage('LOGGED_OUT')).toBe(
            'Ви вийшли з акаунту'
        );
        expect(getApiMessage('ACCOUNT_DELETED')).toBe(
            'Акаунт видалено'
        );
    });

    it('returns Ukrainian message for error codes', () => {
        expect(getApiMessage('UNAUTHORIZED')).toBe(
            'Час сесії вичерпано. Увійдіть знову'
        );
        expect(getApiMessage('INVALID_MAGIC_LINK')).toBe(
            'Посилання недійсне або прострочене'
        );
        expect(getApiMessage('RATE_LIMIT_EXCEEDED')).toBe(
            'Забагато запитів. Спробуйте через 15 хвилин'
        );
    });

    it('returns fallback for unknown codes', () => {
        expect(getApiMessage('UNKNOWN_CODE')).toBe(
            'Сталася помилка. Спробуйте пізніше'
        );
    });

    it('returns payment error messages', () => {
        expect(getApiMessage('ALREADY_SUBSCRIBED')).toBe(
            'У вас вже є активна підписка.'
        );
        expect(getApiMessage('SUBSCRIPTION_REQUIRED')).toBe(
            'Для доступу потрібна активна підписка.'
        );
    });
});
