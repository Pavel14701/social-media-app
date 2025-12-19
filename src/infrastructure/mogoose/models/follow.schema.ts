import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Follow extends Document {
  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  followingId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
