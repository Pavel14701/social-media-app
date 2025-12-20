import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  commenter!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'post', required: true })
  post!: Types.ObjectId;

  @Prop({ type: String, required: true })
  content!: string;

  @Prop({ type: Types.ObjectId, ref: 'comment' })
  parent?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'comment' }], default: [] })
  children!: Types.ObjectId[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'user' },
        type: { type: String, enum: ['like', 'love', 'haha', 'angry', 'sad'] },
      },
    ],
    default: [],
  })
  reactions!: { userId: Types.ObjectId; type: string }[];

  @Prop({ type: Boolean, default: false })
  edited!: boolean;

  @Prop({ type: Boolean, default: false })
  flagged!: boolean;

  @Prop({ type: [String], default: [] })
  reportReasons!: string[];

  @Prop({ type: [String], default: [] })
  mentions!: string[];

  @Prop({ type: [String], default: [] })
  attachments!: string[];

  @Prop({ type: String, default: 'active' })
  status!: string; // active | deleted | hidden | pending

  createdAt!: Date;
  updatedAt!: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Индексы
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ commenter: 1, createdAt: -1 });
CommentSchema.index({ parent: 1 });
CommentSchema.index({ mentions: 1 });
