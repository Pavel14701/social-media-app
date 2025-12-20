import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PostLike extends Document {
  @Prop({ type: Types.ObjectId, ref: 'post' })
  postId?: Types.ObjectId; // лайк поста

  @Prop({ type: Types.ObjectId, ref: 'comment' })
  commentId?: Types.ObjectId; // лайк комментария

  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: ['like', 'love', 'haha', 'angry', 'sad'], default: 'like' })
  type!: string; // строго типизированные реакции

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

  @Prop({ type: Boolean, default: false })
  flagged!: boolean;

  @Prop({ type: [String], default: [] })
  reportReasons!: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

// Индексы
PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
PostLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });
PostLikeSchema.index({ userId: 1, createdAt: -1 });
PostLikeSchema.index({ postId: 1, createdAt: -1 });
PostLikeSchema.index({ type: 1 });
