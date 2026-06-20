import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';

@Schema({ timestamps: { createdAt: true } })
export class Comment {
  createdAt: Date;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  get id() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: CreateCommentDomainDto) {
    const comment = new this();

    comment.userId = dto.userId;
    comment.postId = dto.postId;
    comment.content = dto.content;
    comment.userLogin = dto.userLogin;

    return comment as CommentDocument;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModel = Model<CommentDocument> & typeof Comment;
