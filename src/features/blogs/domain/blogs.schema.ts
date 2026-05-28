import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { UpdateBlogDTO } from './blog.types';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: { createdAt: true } })
export class Blog {
  _id: Types.ObjectId;
  createdAt: Date;

  @Prop({ default: false })
  isMembership: boolean;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  update(DTO: UpdateBlogDTO) {
    this.name = DTO.name;
    this.description = DTO.description;
    this.websiteUrl = DTO.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
