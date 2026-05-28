import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SETTINGS } from './core/settings/settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(SETTINGS.PORT);
}

bootstrap();
