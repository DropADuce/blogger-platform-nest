import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ConfirmEmailDTO,
  CreateUserInputDto,
  EmailResendingDTO,
  NewPasswordInputDto,
  PasswordRecoveryInputDto,
} from './input-dto/create-user.input-dto';
import { ExtractUserFromRequest } from 'modules/user-accounts/guards/decorators/param/extract-user-from-request';
import { UserContextDTO } from 'modules/user-accounts/guards/dto/user-context.dto';
import { LocalAuthGuard } from 'modules/user-accounts/guards/local/local-auth.guard';
import { AuthService } from 'modules/user-accounts/application/auth.service';
import { UsersService } from 'modules/user-accounts/application/users.service';
import { JwtAuthGuard } from 'modules/user-accounts/guards/bearer/jwt-auth.guard';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@ExtractUserFromRequest() user: UserContextDTO) {
    return await this.usersQueryRepository.me(user.id);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@ExtractUserFromRequest() user: UserContextDTO) {
    return await this.authService.login(user.id);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto) {
    return await this.usersService.registerUser(body);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() body: ConfirmEmailDTO) {
    return await this.usersService.confirmEmail(body);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailResendingDTO) {
    return await this.usersService.resendRegistrationEmail(body);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto) {
    return await this.usersService.passwordRecovery(body);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto) {
    return await this.usersService.setNewPassword(body);
  }
}
