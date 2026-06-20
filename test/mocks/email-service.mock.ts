import { EmailService } from 'modules/notifications/application/email.service';

export class EmailServiceMock extends EmailService {
  async sendConfirmationEmail(params: { email: string; code: string }) {
    console.log(
      `Письмо отправлено на email ${params.email}. Код: ${params.code}`,
    );
  }
}
