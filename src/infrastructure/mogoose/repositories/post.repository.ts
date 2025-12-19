// infrastructure/mongoose/post.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Post } from '../models/post.schema';
import { PostDm } from '../../../domain/entities/post.entity';
import { IPostRepository } from '../../../application/interfaces/post-repository.interface';

@Injectable()
export class PostRepository
  extends BaseRepository<PostDm, Post>
  implements IPostRepository
{
  constructor(@InjectModel('post') private readonly postModel: Model<Post>) {
    super(postModel);
  }

  async create(entity: PostDm): Promise<PostDm> {
    const payload = this.toPersistence(entity);
    const doc = await this.postModel.create(payload);
    return this.toDomain(doc);
  }

  async findByAuthor(authorName: string): Promise<PostDm[]> {
    const docs = await this.postModel.find().populate('poster').exec();
    return docs
      .filter((doc: any) => doc.poster.username === authorName)
      .map((doc) => this.toDomain(doc));
  }

  async searchByTitle(query: string): Promise<PostDm[]> {
    const docs = await this.postModel
      .find({ title: { $regex: query, $options: 'i' } })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findSorted(sortBy: string): Promise<PostDm[]> {
    const docs = await this.postModel.find().sort(sortBy).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async paginate(page: number, pageSize: number): Promise<{ data: PostDm[]; count: number }> {
    const count = await this.postModel.countDocuments();
    const docs = await this.postModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    return { data: docs.map((doc) => this.toDomain(doc)), count };
  }

  async incrementLikeCount(postId: string): Promise<void> {
    await this.postModel.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }).exec();
  }

  async incrementCommentCount(postId: string): Promise<void> {
    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }).exec();
  }

  protected toDomain(doc: Post): PostDm {
    return new PostDm(
      doc._id.toString(),
      doc.title,
      doc.content,
      doc.edited,
      doc.likeCount,
      doc.commentCount,
      doc.poster.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toPersistence(entity: Partial<PostDm>): Partial<Post> {
    const update: Partial<Post> = {};
    if (entity.title !== undefined) update.title = entity.title;
    if (entity.content !== undefined) update.content = entity.content;
    if (entity.edited !== undefined) update.edited = entity.edited;
    if (entity.likeCount !== undefined) update.likeCount = entity.likeCount;
    if (entity.commentCount !== undefined) update.commentCount = entity.commentCount;
    if (entity.posterId) update.poster = entity.posterId;
    return update;
  }
}
