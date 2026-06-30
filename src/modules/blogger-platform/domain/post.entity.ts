import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';

export const POST_TITLE_MIN_CONSTRAINTS = 1;
export const POST_TITLE_MAX_CONSTRAINTS = 30;

export const POST_SHORT_DESCRIPTION_MIN_CONSTRAINTS = 1;
export const POST_SHORT_DESCRIPTION_MAX_CONSTRAINTS = 100;

export const POST_CONTENT_MIN_CONSTRAINTS = 1;
export const POST_CONTENT_MAX_CONSTRAINTS = 1_000;

@Schema({ timestamps: { createdAt: true } })
export class Post {
  createdAt: Date;

  @Prop({
    required: true,
    minlength: POST_TITLE_MIN_CONSTRAINTS,
    maxlength: POST_TITLE_MAX_CONSTRAINTS,
  })
  title: string;

  @Prop({
    required: true,
    minlength: POST_SHORT_DESCRIPTION_MIN_CONSTRAINTS,
    maxlength: POST_SHORT_DESCRIPTION_MAX_CONSTRAINTS,
  })
  shortDescription: string;

  @Prop({
    required: true,
    minlength: POST_CONTENT_MIN_CONSTRAINTS,
    maxlength: POST_CONTENT_MAX_CONSTRAINTS,
  })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  get id() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;

    return post as PostDocument;
  }

  updatePost(dto: UpdatePostDomainDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
  }

  updateBlogName(blogName: string) {
    this.blogName = blogName;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModel = Model<PostDocument> & typeof Post;
