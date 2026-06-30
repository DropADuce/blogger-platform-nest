import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { JwtAuthGuard } from 'modules/user-accounts/guards/bearer/jwt-auth.guard';
import { UpdateLikeStatusInputDto } from 'modules/blogger-platform/api/input-dto/update-like-status.input-dto';
import { ExtractUserFromRequest } from 'modules/user-accounts/guards/decorators/param/extract-user-from-request';
import { UserContextDTO } from 'modules/user-accounts/guards/dto/user-context.dto';
import { UpdateLikeByCommentCommand } from 'modules/blogger-platform/application/use-cases/update-like-by-comment.use-case';
import { JwtOptionalAuthGuard } from 'modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequestOptional } from 'modules/user-accounts/guards/decorators/param/extract-user-from-request-optional';
import { GetCommentQuery } from 'modules/blogger-platform/application/queries/get-comment.query-handler';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { UpdateCommentCommand } from 'modules/blogger-platform/application/use-cases/update-comment.use-case';
import { DeleteCommentCommand } from 'modules/blogger-platform/application/use-cases/delete-comment.use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getComment(
    @Param('id') id: string,
    @ExtractUserFromRequestOptional() user: UserContextDTO,
  ) {
    return this.queryBus.execute(new GetCommentQuery(id, user?.id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDTO,
  ) {
    return await this.commandBus.execute(
      new UpdateCommentCommand(user.id, id, updateCommentDto.content),
    );
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateLikeStatus(
    @Param('id') id: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDTO,
  ) {
    return await this.commandBus.execute(
      new UpdateLikeByCommentCommand(body.likeStatus, id, user.id),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<void> {
    return await this.commandBus.execute(new DeleteCommentCommand(user.id, id));
  }
}
