import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './api/users.controller';
import { User, UserSchema } from './domain/user.entity';
import { UsersService } from './application/users.service';
import { BcryptService } from './application/bcrypt.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersExternalRepository } from './infrastructure/external-query/users.external-repository';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from 'modules/notifications/notificatoins.module';
import { AuthController } from 'modules/user-accounts/api/auth.controller';
import { AuthService } from 'modules/user-accounts/application/auth.service';
import { LocalStrategy } from 'modules/user-accounts/guards/local/local.strategy';
import { JwtStrategy } from 'modules/user-accounts/guards/bearer/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  controllers: [AuthController, UsersController],
  providers: [
    JwtStrategy,
    LocalStrategy,
    BcryptService,
    AuthService,
    AuthController,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalRepository,
  ],
  exports: [JwtStrategy, UsersExternalRepository],
})
export class UserAccountsModule {}
