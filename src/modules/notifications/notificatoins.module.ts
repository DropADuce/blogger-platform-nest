import { join } from 'path';

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

import { SETTINGS } from 'core/settings/settings';
import { EmailService } from './application/email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.yandex.com',
        port: 465,
        secure: true,
        auth: {
          user: SETTINGS.EMAIL_USER,
          pass: SETTINGS.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Blogger Platform" <${SETTINGS.EMAIL_USER}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
