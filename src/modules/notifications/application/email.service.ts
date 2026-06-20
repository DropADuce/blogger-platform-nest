import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(params: { email: string; code: string }) {
    await this.mailerService.sendMail({
      to: params.email,
      subject: 'Подтверждение регистрации',
      template: 'confirm-email',
      context: { code: params.code },
    });
  }

  async sendPasswordRecoveryEmail(params: { email: string; code: string }) {
    await this.mailerService.sendMail({
      to: params.email,
      subject: 'Восстановление пароля',
      template: 'password-recovery',
      context: { code: params.code },
    });
  }
}
