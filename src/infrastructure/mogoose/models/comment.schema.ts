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

  @Prop({ type: Boolean, default: false })
  edited!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);