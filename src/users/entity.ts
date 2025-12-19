// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import filter from '../../util/filter';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: '' })
  biography?: string;

  @Prop({ default: false })
  isAdmin!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// хук перед сохранением
UserSchema.pre<User>('save', function () {
  if (filter.isProfane(this.username)) {
    throw new Error('Username cannot contain profanity');
  }

  if (this.biography.length > 0) {
    this.biography = filter.clean(this.biography);
  }
});
