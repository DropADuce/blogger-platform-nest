import { INestApplication } from '@nestjs/common';

import { AppValidationPipe } from 'core/pipes';

export const appSetup = (app: INestApplication) => {
  app.enableCors();
  app.useGlobalPipes(new AppValidationPipe());
};
