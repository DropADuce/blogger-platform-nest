import { configModule } from './dynamic-config.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './api/app.controller';
import { AppService } from './application/app.service';
import { SETTINGS } from '../core/settings/settings';
import { UserAccountsModule } from '../modules/user-accounts/user-accounts.module';
import { BloggerPlatformModule } from '../modules/blogger-platform/blogger-platform.module';
import { TestingModule } from '../modules/testing/testing.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHTTPExceptionsFilter } from '../core/exceptions/filters/all-exceptions.filter';
import { DomainHTTPExceptionFilter } from '../core/exceptions/filters/domain-exception.filter';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(SETTINGS.MONGO_DB_URL, {
      dbName: SETTINGS.MONGO_DB_NAME,
    }),
    UserAccountsModule,
    BloggerPlatformModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllHTTPExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainHTTPExceptionFilter },
  ],
})
export class AppModule {}
