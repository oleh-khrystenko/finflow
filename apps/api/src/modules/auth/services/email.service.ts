import { Injectable, Logger } from '@nestjs/common';
import { MAGIC_LINK_PURPOSE, type MagicLinkPurpose } from '@finflow/types';
import { Resend } from 'resend';

import { ENV } from '../../../config/env';

interface EmailTemplate {
    subject: string;
    body: string;
    cta: string;
    footer: string;
}

const TEMPLATES: Record<MagicLinkPurpose, EmailTemplate> = {
    [MAGIC_LINK_PURPOSE.LOGIN]: {
        subject: 'Вхід до FinFlow',
        body: 'Натисніть кнопку нижче, щоб увійти у ваш акаунт.',
        cta: 'Увійти',
        footer: 'Посилання дійсне 15 хвилин. Якщо ви не запитували вхід — ігноруйте цей лист.',
    },
    [MAGIC_LINK_PURPOSE.REGISTER]: {
        subject: 'Ласкаво просимо до FinFlow',
        body: 'Натисніть кнопку нижче, щоб завершити реєстрацію.',
        cta: 'Завершити реєстрацію',
        footer: 'Посилання дійсне 15 хвилин. Якщо ви не реєструвалися — ігноруйте цей лист.',
    },
    [MAGIC_LINK_PURPOSE.RESET_PASSWORD]: {
        subject: 'Скидання пароля',
        body: 'Натисніть кнопку нижче, щоб скинути пароль.',
        cta: 'Скинути пароль',
        footer: 'Посилання дійсне 15 хвилин. Якщо ви не запитували скидання — ігноруйте цей лист.',
    },
    [MAGIC_LINK_PURPOSE.DELETE_ACCOUNT]: {
        subject: 'Підтвердження видалення акаунту',
        body: 'Натисніть кнопку нижче, щоб підтвердити видалення акаунту. Після підтвердження у вас буде 30 днів, щоб відновити акаунт — просто увійдіть у свій акаунт протягом цього часу.',
        cta: 'Підтвердити видалення',
        footer: 'Посилання дійсне 15 хвилин. Якщо ви не запитували видалення — ігноруйте цей лист.',
    },
};

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly resend = new Resend(ENV.RESEND_API_KEY);

    async sendMagicLink(
        email: string,
        token: string,
        purpose: MagicLinkPurpose = MAGIC_LINK_PURPOSE.LOGIN
    ): Promise<void> {
        const link = `${ENV.WEB_URL}/auth/verify?token=${token}`;
        const t = TEMPLATES[purpose];

        const { error } = await this.resend.emails.send({
            from: ENV.RESEND_FROM_EMAIL,
            to: email,
            subject: t.subject,
            html: `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #f4f4f5; padding: 40px 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; text-align: center;">
    <h1 style="font-size: 24px; color: #18181b; margin-bottom: 8px;">FinFlow</h1>
    <p style="color: #52525b; font-size: 16px; margin-bottom: 32px;">
      ${t.body}
    </p>
    <a href="${link}"
       style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none;
              padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
      ${t.cta}
    </a>
    <p style="color: #a1a1aa; font-size: 13px; margin-top: 32px;">
      ${t.footer}
    </p>
  </div>
</body>
</html>`.trim(),
        });

        if (error) {
            this.logger.error(
                `Failed to send magic link to ${email}: ${error.message}`
            );
            throw new Error(`Failed to send email: ${error.message}`);
        }

        this.logger.log(`Magic link (${purpose}) sent to ${email}`);
    }

    async sendDeletionConfirmation(
        email: string,
        deletionDate: Date
    ): Promise<void> {
        const formattedDate = deletionDate.toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const t = {
            subject: 'Ваш акаунт деактивовано',
            body: `Ваш акаунт FinFlow деактивовано. Усі дані буде остаточно видалено <strong>${formattedDate}</strong>.`,
            instruction:
                'Щоб відновити акаунт, просто увійдіть протягом 30 днів.',
            cta: 'Увійти',
            footer: 'Якщо ви не запитували видалення — увійдіть у свій акаунт якомога швидше.',
        };

        const { error } = await this.resend.emails.send({
            from: ENV.RESEND_FROM_EMAIL,
            to: email,
            subject: t.subject,
            html: `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #f4f4f5; padding: 40px 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; text-align: center;">
    <h1 style="font-size: 24px; color: #18181b; margin-bottom: 8px;">FinFlow</h1>
    <p style="color: #52525b; font-size: 16px; margin-bottom: 16px;">
      ${t.body}
    </p>
    <p style="color: #52525b; font-size: 16px; margin-bottom: 32px;">
      ${t.instruction}
    </p>
    <a href="${ENV.WEB_URL}"
       style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none;
              padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
      ${t.cta}
    </a>
    <p style="color: #a1a1aa; font-size: 13px; margin-top: 32px;">
      ${t.footer}
    </p>
  </div>
</body>
</html>`.trim(),
        });

        if (error) {
            this.logger.error(
                `Failed to send deletion confirmation to ${email}: ${error.message}`
            );
            throw new Error(`Failed to send email: ${error.message}`);
        }

        this.logger.log(`Deletion confirmation sent to ${email}`);
    }
}
