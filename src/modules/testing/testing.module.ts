import { Module } from '@nestjs/common';

import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BloggerPlatformModule } from '../blogger-platform/blogger-platform.module';
import { TestingController } from './api/testing.controller';
import { TestingService } from './application/testing.service';

@Module({
  imports: [UserAccountsModule, BloggerPlatformModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
