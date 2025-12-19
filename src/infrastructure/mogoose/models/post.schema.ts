import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: String, required: true, maxlength: 80 })
  title!: string;

  @Prop({ type: String, required: true, maxlength: 8000 })
  content!: string;

  @Prop({ type: Boolean, default: false })
  edited!: boolean;

  @Prop({ type: Number, default: 0 })
  likeCount!: number;

  @Prop({ type: Number, default: 0 })
  commentCount!: number;

  @Prop({ type: String, ref: 'user', required: true })
  poster!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);