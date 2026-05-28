import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';

import { Comment } from '../domain/comment.schema';
import {
  createPaginatedResult,
  createSort,
  PaginationQuery,
} from '../../../shared/pagination';

type CommentViewModel = {
  id: string;
  content: string;
  createdAt: string;
  commentatorInfo: CommentatorInfo;
  likesInfo: LikesInfo;
};

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
};

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
  ) {}

  private mapCommentToViewModel(comment: Comment): CommentViewModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
      createdAt: comment.createdAt.toISOString(),
    };
  }

  async findCommentById(id: string) {
    const comment = await this.commentModel.findById(id).lean().exec();

    if (!comment) throw new NotFoundException();

    return this.mapCommentToViewModel(comment);
  }

  async findCommentsByPost(params: {
    postId: string;
    sort: { by: string; direction: SortOrder };
    pagination: PaginationQuery;
  }) {
    const sort = params.sort ? createSort(params.sort) : {};

    const [comments, count] = await Promise.all([
      this.commentModel
        .find({ postId: params.postId })
        .sort(sort)
        .skip(params.pagination.skip)
        .limit(params.pagination.limit)
        .lean()
        .exec(),
      this.commentModel.countDocuments({ postId: params.postId }),
    ]);

    return createPaginatedResult({
      pageSize: params.pagination.pageSize,
      pageNumber: params.pagination.pageNumber,
      count,
      items: comments.map(this.mapCommentToViewModel),
    });
  }
}
