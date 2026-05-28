import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { UsersService } from '../domain/users.service';
import { CreateUserDTO, GetUsersQueryParams } from './users.dto';
import { UsersQueryRepository } from '../repositories/users.query-repository';
import { parseSortPagination } from '../../../shared/pagination';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsers(@Query() query: GetUsersQueryParams) {
    return this.usersQueryRepository.getUsers({
      query: { login: query.searchLoginTerm, email: query.searchEmailTerm },
      ...parseSortPagination(query),
    });
  }

  @Post()
  async createUser(@Body() DTO: CreateUserDTO) {
    const userId = await this.usersService.createUser(DTO);
    return this.usersQueryRepository.getUserById(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);

    return;
  }
}
