import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from './email.service';

jest.mock('../../../config/env', () => ({
    ENV: {
        RESEND_API_KEY: 'test-key',
        RESEND_FROM_EMAIL: 'FinFlow <test@resend.dev>',
        WEB_URL: 'http://localhost:3000',
    },
}));

jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: {
            send: jest.fn().mockResolvedValue({ error: null }),
        },
    })),
}));

describe('EmailService', () => {
    let emailService: EmailService;
    let sendSpy: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EmailService],
        }).compile();

        emailService = module.get<EmailService>(EmailService);
        sendSpy = (emailService as any).resend.emails.send;
        jest.clearAllMocks();
    });

    describe('sendMagicLink', () => {
        const email = 'user@example.com';
        const token = 'abc123';

        it('should use login template for purpose login', async () => {
            await emailService.sendMagicLink(email, token, 'login');

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: email,
                    subject: 'Вхід до FinFlow',
                })
            );
            const html = sendSpy.mock.calls[0][0].html as string;
            expect(html).toContain('Увійти');
            expect(html).toContain(`token=${token}`);
        });

        it('should use register template for purpose register', async () => {
            await emailService.sendMagicLink(email, token, 'register');

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'Ласкаво просимо до FinFlow',
                })
            );
            const html = sendSpy.mock.calls[0][0].html as string;
            expect(html).toContain('Завершити реєстрацію');
        });

        it('should use reset-password template', async () => {
            await emailService.sendMagicLink(email, token, 'reset-password');

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'Скидання пароля',
                })
            );
            const html = sendSpy.mock.calls[0][0].html as string;
            expect(html).toContain('Скинути пароль');
        });

        it('should use delete-account template', async () => {
            await emailService.sendMagicLink(email, token, 'delete-account');

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'Підтвердження видалення акаунту',
                })
            );
            const html = sendSpy.mock.calls[0][0].html as string;
            expect(html).toContain('Підтвердити видалення');
            expect(html).toContain('30 днів');
        });

        it('should include token in link for all purposes', async () => {
            const purposes = [
                'login',
                'register',
                'reset-password',
                'delete-account',
            ] as const;

            for (const purpose of purposes) {
                sendSpy.mockClear();
                await emailService.sendMagicLink(email, token, purpose);

                const html = sendSpy.mock.calls[0][0].html as string;
                expect(html).toContain(
                    `http://localhost:3000/auth/verify?token=${token}`
                );
            }
        });

        it('should throw error when Resend fails', async () => {
            sendSpy.mockResolvedValue({
                error: { message: 'Send failed' },
            });

            await expect(
                emailService.sendMagicLink(email, token, 'login')
            ).rejects.toThrow('Failed to send email: Send failed');
        });

        it('should set html lang to uk', async () => {
            await emailService.sendMagicLink(email, token, 'login');

            const html = sendSpy.mock.calls[0][0].html as string;
            expect(html).toContain('lang="uk"');
        });
    });

    describe('sendDeletionConfirmation', () => {
        const email = 'user@example.com';
        const deletionDate = new Date('2026-03-29T12:00:00Z');

        it('should send deletion confirmation with correct subject', async () => {
            await emailService.sendDeletionConfirmation(email, deletionDate);

            expect(sendSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: email,
                    subject: 'Ваш акаунт деактивовано',
                })
            );
        });

        it('should include formatted deletion date in HTML', async () => {
            await emailService.sendDeletionConfirmation(email, deletionDate);

            const html = sendSpy.mock.calls[0][0].html as string;
            expect(html).toContain('2026');
        });

        it('should include WEB_URL link for recovery', async () => {
            await emailService.sendDeletionConfirmation(email, deletionDate);

            const html = sendSpy.mock.calls[0][0].html as string;
            expect(html).toContain('http://localhost:3000');
        });

        it('should throw error when Resend fails', async () => {
            sendSpy.mockResolvedValue({
                error: { message: 'Send failed' },
            });

            await expect(
                emailService.sendDeletionConfirmation(email, deletionDate)
            ).rejects.toThrow('Failed to send email: Send failed');
        });
    });
});
