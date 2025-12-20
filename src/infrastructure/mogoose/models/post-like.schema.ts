import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PostLike extends Document {
  @Prop({ type: Types.ObjectId, ref: 'post', required: true })
  postId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, default: 'like' })
  type!: string; // like | love | haha | angry

  @Prop({ type: String, default: 'web' })
  source!: string; // web | mobile | api

  @Prop({ type: Number, default: 1 })
  weight!: number;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, any>;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  deviceId?: string;

  @Prop({ type: String })
  sessionId?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

// Индексы для оптимизации
PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
PostLikeSchema.index({ userId: 1, createdAt: -1 });
PostLikeSchema.index({ postId: 1, createdAt: -1 });
PostLikeSchema.index({ type: 1 });
