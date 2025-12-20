import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Follow extends Document {
  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  userId!: Types.ObjectId; // кто подписывается

  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  followingId!: Types.ObjectId; // на кого подписываются

  @Prop({ type: String, default: 'active' })
  status!: string; // active | pending | blocked

  @Prop({ type: Boolean, default: false })
  mutual!: boolean; // взаимная подписка

  @Prop({ type: Boolean, default: true })
  notificationsEnabled!: boolean; // уведомления от этого пользователя

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, any>; // универсальное поле

  @Prop({ type: String })
  source?: string; // web | mobile | api

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  deviceId?: string;

  @Prop({ type: Date })
  expiresAt?: Date; // временные подписки

  @Prop({ type: Number, default: 0 })
  priority!: number; // важность (например VIP)

  createdAt!: Date;
  updatedAt!: Date;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Индексы
FollowSchema.index({ userId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1, createdAt: -1 });
FollowSchema.index({ userId: 1, createdAt: -1 });
FollowSchema.index({ status: 1 });
