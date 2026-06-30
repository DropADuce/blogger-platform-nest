import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDomainDto } from './dto/update-blog.domain.dto';

export const BLOG_NAME_MIN_LENGTH_CONSTRAINTS = 1;
export const BLOG_NAME_MAX_LENGTH_CONSTRAINTS = 15;

export const BLOG_DESCRIPTION_MIN_LENGTH_CONSTRAINTS = 1;
export const BLOG_DESCRIPTION_MAX_LENGTH_CONSTRAINTS = 500;

export const BLOG_WEBSITE_MAX_LENGTH_CONSTRAINTS = 100;

@Schema({ timestamps: { createdAt: true } })
export class Blog {
  createdAt: Date;

  @Prop({
    required: true,
    minlength: BLOG_NAME_MIN_LENGTH_CONSTRAINTS,
    maxlength: BLOG_NAME_MAX_LENGTH_CONSTRAINTS,
  })
  name: string;

  @Prop({
    required: true,
    minlength: BLOG_DESCRIPTION_MIN_LENGTH_CONSTRAINTS,
    maxlength: BLOG_DESCRIPTION_MAX_LENGTH_CONSTRAINTS,
  })
  description: string;

  @Prop({ required: true, maxlength: BLOG_WEBSITE_MAX_LENGTH_CONSTRAINTS })
  websiteUrl: string;

  @Prop({ default: false })
  isMembership: boolean;

  get id() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog as BlogDocument;
  }

  update(dto: UpdateBlogDomainDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModel = Model<BlogDocument> & typeof Blog;
