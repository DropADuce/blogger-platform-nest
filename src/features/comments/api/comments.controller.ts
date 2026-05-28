import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../repositories/comments.query-repository';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async getComment(@Param('id') id: string) {
    return this.commentsQueryRepository.findCommentById(id);
  }
}
