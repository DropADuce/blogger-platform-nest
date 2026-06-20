import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import * as crypto from 'node:crypto';

export const LOGIN_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 10,
};

export const PASSWORD_CONSTRAINTS = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 20,
};

export const EMAIL_CONSTRAINTS = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

@Schema({ timestamps: { createdAt: true } })
export class User {
  createdAt: Date;

  @Prop({
    required: true,
    minlength: LOGIN_CONSTRAINTS.MIN_LENGTH,
    maxlength: LOGIN_CONSTRAINTS.MAX_LENGTH,
  })
  login: string;

  @Prop({
    required: true,
    match: EMAIL_CONSTRAINTS.match,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, default: null })
  verificationCode: string | null;

  @Prop({ type: Date, default: null })
  codeExpiry: Date | null;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean;

  get id() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._id.toString();
  }

  setIsConfirmed(isConfirmed: boolean) {
    this.isConfirmed = isConfirmed;
  }

  setVerificationCode() {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);

    this.verificationCode = crypto.randomUUID();
    this.codeExpiry = expiry;
  }

  clearVerificationCode() {
    this.verificationCode = null;
    this.codeExpiry = null;
  }

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();

    user.login = dto.login;
    user.email = dto.email;
    user.password = dto.password;

    user.setVerificationCode();
    user.setIsConfirmed(false);

    return user as UserDocument;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModel = Model<UserDocument> & typeof User;
