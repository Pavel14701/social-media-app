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

  @Prop({ type: Number, default: 0 })
  views!: number;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Boolean, default: true })
  isPublished!: boolean;

  @Prop({ type: [String], default: [] })
  attachments!: string[];

  @Prop({ type: String, ref: 'user', required: true })
  poster!: string;

  @Prop({ type: String, default: 'draft' })
  status!: string; // draft | published | archived | flagged

  @Prop({ type: String })
  category?: string;

  @Prop({ type: String, unique: true })
  slug!: string;

  @Prop({ type: Boolean, default: false })
  flagged!: boolean;

  @Prop({ type: Number, default: 0 })
  shareCount!: number;

  @Prop({ type: Number, default: 0 })
  rating!: number;

  @Prop({ type: String })
  updatedBy?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// 🔧 Индексы для ускорения выборок
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ poster: 1, createdAt: -1 });
PostSchema.index({ tags: 1, isPublished: 1 });
PostSchema.index({ slug: 1 }, { unique: true });
PostSchema.index({ category: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ views: -1 });
PostSchema.index({ likeCount: -1 });
