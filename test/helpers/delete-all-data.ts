import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const deleteAllData = (app: INestApplication) => {
  return request(app.getHttpServer()).delete('/testing/all-data');
};
