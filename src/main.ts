import { NestFactory } from '@nestjs/core';

import { AppModule } from 'app/app.module';
import { SETTINGS } from 'core/settings/settings';
import { appSetup } from 'app/setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSetup(app);

  await app.listen(SETTINGS.PORT);
}

bootstrap();
