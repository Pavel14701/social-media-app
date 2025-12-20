import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'conversation', required: true })
  conversation!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender!: Types.ObjectId;

  @Prop({ type: String, required: true })
  content!: string;

  @Prop({ type: Boolean, default: false })
  read!: boolean;

  @Prop({ type: [String], default: [] })
  attachments!: string[];

  @Prop({ type: Boolean, default: false })
  edited!: boolean;

  @Prop({ type: Boolean, default: false })
  deleted!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'message' })
  replyTo?: Types.ObjectId;

  @Prop({ type: String, default: 'text' })
  type!: string; // text | image | file | system

  @Prop({ type: [{ userId: String, emoji: String }], default: [] })
  reactions!: { userId: string; emoji: string }[];

  @Prop({ type: Boolean, default: false })
  delivered!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  seenBy!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'thread' })
  threadId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'message' })
  forwardedFrom?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  mentions!: string[];

  @Prop({ type: Number, default: 0 })
  priority!: number;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: { lat: Number, lng: Number }, _id: false })
  location?: { lat: number; lng: number };

  @Prop({ type: String })
  language?: string;

  @Prop({ type: Boolean, default: false })
  encrypted!: boolean;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, any>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Индексы для ускорения выборок
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ replyTo: 1 });
MessageSchema.index({ threadId: 1 });
MessageSchema.index({ forwardedFrom: 1 });
MessageSchema.index({ mentions: 1 });
MessageSchema.index({ expiresAt: 1 });
MessageSchema.index({ type: 1 });
MessageSchema.index({ read: 1 });
