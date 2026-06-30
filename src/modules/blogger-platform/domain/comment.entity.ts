import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDomainDTO } from 'modules/blogger-platform/domain/dto/update-comment.domain-dto';

export const CONTENT_CONSTRAINTS_MIN = 20;
export const CONTENT_CONSTRAINTS_MAX = 300;

@Schema({ timestamps: { createdAt: true } })
export class Comment {
  createdAt: Date;

  @Prop({ required: true })
  postId: string;

  @Prop({
    required: true,
    minlength: CONTENT_CONSTRAINTS_MIN,
    maxlength: CONTENT_CONSTRAINTS_MAX,
  })
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

  update(dto: UpdateCommentDomainDTO) {
    this.content = dto.content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModel = Model<CommentDocument> & typeof Comment;
