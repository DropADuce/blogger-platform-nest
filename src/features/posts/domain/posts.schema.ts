import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UpdatePostDTO } from './posts.types';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: { createdAt: true } })
export class Post {
  _id: Types.ObjectId;
  createdAt: Date;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  updateBlogName(blogName: string) {
    this.blogName = blogName;
  }

  updatePost(DTO: UpdatePostDTO) {
    this.title = DTO.title;
    this.content = DTO.content;
    this.shortDescription = DTO.shortDescription;
    this.blogId = DTO.blogId;
    this.blogName = DTO.blogName;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
