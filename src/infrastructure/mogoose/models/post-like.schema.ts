import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class PostLike extends Document {
  @Prop({ type: Types.ObjectId, ref: 'post', required: true })
  postId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  userId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
