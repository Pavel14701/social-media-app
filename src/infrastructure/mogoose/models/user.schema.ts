import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ default: '' })
  biography: string = '';

  @Prop({ default: false })
  isAdmin!: boolean;

  @Prop({ type: String })
  firstName?: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: String, unique: true })
  phoneNumber?: string;

  @Prop({ type: String })
  avatarUrl?: string;

  @Prop({ type: [String], default: [] })
  roles!: string[];

  @Prop({ type: String, default: 'active' })
  status!: string; // active | banned | pending | deleted

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Date })
  lastSeenAt?: Date;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'conversation', default: [] })
  conversations!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  friends!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  followers!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  following!: Types.ObjectId[];

  @Prop({ type: Boolean, default: true })
  notificationsEnabled!: boolean;

  @Prop({ type: Map, of: String, default: {} })
  preferences!: Map<string, string>;

  @Prop({ type: Object, default: {} })
  security!: {
    twoFactorEnabled?: boolean;
    failedLoginAttempts?: number;
    lockedUntil?: Date;
  };

  @Prop({ type: Boolean, default: false })
  verified!: boolean;

  @Prop({ type: Date })
  birthDate?: Date;

  @Prop({ type: String })
  gender?: string;

  @Prop({ type: [{ city: String, country: String, street: String }], default: [] })
  addresses!: { city: string; country: string; street: string }[];

  @Prop({ type: [Object], default: [] })
  auditLog!: { action: string; at: Date; actor?: string }[];

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Индексы
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ lastLoginAt: -1 });
UserSchema.index({ lastSeenAt: -1 });
