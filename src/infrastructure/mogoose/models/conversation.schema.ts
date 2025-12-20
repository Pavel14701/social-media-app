import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'user' }], required: true })
  recipients!: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isGroup!: boolean;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'user' }], default: [] })
  admins!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'message' })
  lastMessageId?: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCounts!: Map<string, number>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'user' }], default: [] })
  mutedUsers!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'message' })
  pinnedMessageId?: Types.ObjectId;

  @Prop({ type: String, default: 'active' })
  status!: string; // active | archived | deleted

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'user' }], default: [] })
  blockedUsers!: Types.ObjectId[];

  @Prop({ type: Date })
  lastActivityAt?: Date;

  @Prop({ type: [{ actor: Types.ObjectId, action: String, at: Date }], default: [] })
  auditLog!: { actor: Types.ObjectId; action: string; at: Date }[];

  @Prop({ type: [{ userId: Types.ObjectId, role: String }], default: [] })
  roles!: { userId: Types.ObjectId; role: string }[];

  @Prop({ type: [{ userId: Types.ObjectId, invitedAt: Date }], default: [] })
  invites!: { userId: Types.ObjectId; invitedAt: Date }[];

  @Prop({ type: [{ userId: Types.ObjectId, until: Date }], default: [] })
  archivedBy!: { userId: Types.ObjectId; until?: Date }[];

  @Prop({ type: Map, of: Object, default: {} })
  customSettings!: Map<string, any>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'file' }], default: [] })
  attachmentsIndex!: Types.ObjectId[];

  @Prop({ type: String, default: 'direct' })
  conversationType!: string; // direct | group | channel | support

  @Prop({ type: Number, default: 0 })
  priority!: number;

  @Prop({ type: [{ key: String, value: String }], default: [] })
  integrationKeys!: { key: string; value: string }[];

  @Prop({ type: Boolean, default: false })
  encrypted!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Индексы
ConversationSchema.index({ recipients: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ status: 1 });
ConversationSchema.index({ conversationType: 1 });
ConversationSchema.index({ expiresAt: 1 });
