import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../domain/posts.schema';
import { Model, SortOrder } from 'mongoose';
import {
  createPaginatedResult,
  createSort,
  PaginationQuery,
} from '../../../shared/pagination';

type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: LikesInfo;
};

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
  newestLikes: Array<NewestLikes>;
};

type NewestLikes = {
  addedAt: string;
  userId: string;
  login: string;
};

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  private mapPostToViewModel(post: Post): PostViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }

  async getPostById(id: string) {
    const post = await this.postModel.findById(id).lean().exec();

    if (!post) throw new NotFoundException('Post not found');

    return this.mapPostToViewModel(post);
  }

  async getPosts(params: {
    sort?: { by: string; direction: SortOrder };
    pagination: PaginationQuery;
  }) {
    const sort = params.sort ? createSort(params.sort) : {};

    const [posts, count] = await Promise.all([
      this.postModel
        .find()
        .sort(sort)
        .skip(params.pagination.skip)
        .limit(params.pagination.limit)
        .lean()
        .exec(),
      this.postModel.countDocuments(),
    ]);

    return createPaginatedResult({
      pageSize: params.pagination.pageSize,
      pageNumber: params.pagination.pageNumber,
      count,
      items: posts.map(this.mapPostToViewModel),
    });
  }

  async getPostsByBlogId(params: {
    blogId: string;
    sort?: { by: string; direction: SortOrder };
    pagination: PaginationQuery;
  }) {
    const filter = { blogId: params.blogId };

    const sort = params.sort ? createSort(params.sort) : {};

    const [posts, count] = await Promise.all([
      this.postModel
        .find(filter)
        .sort(sort)
        .skip(params.pagination.skip)
        .limit(params.pagination.limit)
        .lean()
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    return createPaginatedResult({
      pageSize: params.pagination.pageSize,
      pageNumber: params.pagination.pageNumber,
      count,
      items: posts.map(this.mapPostToViewModel),
    });
  }
}
