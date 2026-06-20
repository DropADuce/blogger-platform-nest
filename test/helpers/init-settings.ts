import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';

import { AppModule } from 'app/app.module';
import { EmailService } from 'modules/notifications/application/email.service';
import { EmailServiceMock } from '../mocks/email-service.mock';
import { appSetup } from 'app/setup/app.setup';
import { UsersTestingManager } from './users-testing-manager';
import { deleteAllData } from './delete-all-data';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingModule = await testingModuleBuilder.compile();

  const app = testingModule.createNestApplication();

  appSetup(app);

  await app.init();

  const dbConnection = app.get(getConnectionToken());
  const httpServer = app.getHttpServer();
  const userTestManager = new UsersTestingManager(app);

  await deleteAllData(app);

  return {
    app,
    dbConnection,
    httpServer,
    userTestManager,
  };
};
