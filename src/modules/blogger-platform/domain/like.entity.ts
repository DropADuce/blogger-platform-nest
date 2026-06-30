import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { AddReactionDomainDto } from 'modules/blogger-platform/domain/dto/add-reaction.domain.dto';
import { UpdateReactionDomainDto } from 'modules/blogger-platform/domain/dto/update-reaction.domain.dto';

type Entity = 'Post' | 'Comment';
type Status = 'Like' | 'Dislike' | 'None';

@Schema({ timestamps: { createdAt: true } })
export class Like {
  createdAt: Date;

  @Prop({ required: true })
  entity: Entity;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  status: Status;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  get id() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: AddReactionDomainDto): LikeDocument {
    const reaction = new this();

    reaction.entity = dto.entity;
    reaction.entityId = dto.entityId;
    reaction.status = dto.status;
    reaction.userId = dto.userId;
    reaction.userLogin = dto.userLogin;

    return reaction as LikeDocument;
  }

  updateStatus(dto: UpdateReactionDomainDto) {
    this.status = dto.status;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModel = Model<LikeDocument> & typeof Like;
