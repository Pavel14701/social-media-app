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

  async searchInContent(keyword: string): Promise<PostDm[]> {
    const docs = await this.postModel
      .find({ content: { $regex: keyword, $options: 'i' } })
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

  async incrementViewCount(postId: string): Promise<void> {
    await this.postModel.findByIdAndUpdate(postId, { $inc: { views: 1 } }).exec();
  }

  async updateContent(postId: string, newTitle: string, newContent: string): Promise<PostDm | null> {
    const doc = await this.postModel.findByIdAndUpdate(
      postId,
      { title: newTitle, content: newContent, edited: true },
      { new: true }
    ).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async deletePost(postId: string): Promise<void> {
    await this.postModel.findByIdAndDelete(postId).exec();
  }

  async deleteByAuthor(authorId: string): Promise<void> {
    await this.postModel.deleteMany({ poster: authorId }).exec();
  }

  async countByAuthor(authorId: string): Promise<number> {
    return this.postModel.countDocuments({ poster: authorId }).exec();
  }

  async findRecentByAuthor(authorId: string, limit: number): Promise<PostDm[]> {
    const docs = await this.postModel
      .find({ poster: authorId })
      .sort('-createdAt')
      .limit(limit)
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByTags(tags: string[]): Promise<PostDm[]> {
    const docs = await this.postModel.find({ tags: { $in: tags } }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findPublished(): Promise<PostDm[]> {
    const docs = await this.postModel.find({ isPublished: true }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findDrafts(): Promise<PostDm[]> {
    const docs = await this.postModel.find({ status: 'draft' }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByCategory(category: string): Promise<PostDm[]> {
    const docs = await this.postModel.find({ category }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findMostLiked(limit: number): Promise<PostDm[]> {
    const docs = await this.postModel.find().sort('-likeCount').limit(limit).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findLeastLiked(limit: number): Promise<PostDm[]> {
    const docs = await this.postModel.find().sort('likeCount').limit(limit).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findMostViewed(limit: number): Promise<PostDm[]> {
    const docs = await this.postModel.find().sort('-views').limit(limit).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findLeastViewed(limit: number): Promise<PostDm[]> {
    const docs = await this.postModel.find().sort('views').limit(limit).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findWithoutComments(limit: number): Promise<PostDm[]> {
    const docs = await this.postModel.find({ commentCount: 0 }).limit(limit).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async getTopAuthors(limit: number): Promise<{ authorId: string; count: number }[]> {
    const result = await this.postModel.aggregate([
      { $group: { _id: '$poster', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ authorId: r._id.toString(), count: r.count }));
  }

  async getTrendingTags(limit: number): Promise<{ tag: string; count: number }[]> {
    const result = await this.postModel.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ tag: r._id, count: r.count }));
  }

protected toDomain(doc: Post): PostDm {
  return PostDm.fromDoc(doc);
}

  protected toPersistence(entity: Partial<PostDm>): Partial<Post> {
    const update: Partial<Post> = {};
    if (entity.title !== undefined) update.title = entity.title;
    if (entity.content !== undefined) update.content = entity.content;
    if (entity.edited !== undefined) update.edited = entity.edited;
    if (entity.likeCount !== undefined) update.likeCount = entity.likeCount;
    if (entity.commentCount !== undefined) update.commentCount = entity.commentCount;
    if (entity.views !== undefined) update.views = entity.views;
    if (entity.tags !== undefined) update.tags = entity.tags;
    if (entity.isPublished !== undefined) update.isPublished = entity.isPublished;
    if (entity.attachments !== undefined) update.attachments = entity.attachments;
    if (entity.status !== undefined) update.status = entity.status;
    if (entity.category !== undefined) update.category = entity.category;
    if (entity.slug !== undefined) update.slug = entity.slug;
    if (entity.flagged !== undefined) update.flagged = entity.flagged;
    if (entity.shareCount !== undefined) update.shareCount = entity.shareCount;
    if (entity.rating !== undefined) update.rating = entity.rating;
    if (entity.updatedBy !== undefined) update.updatedBy = entity.updatedBy;
    if (entity.posterId) update.poster = entity.posterId;
    return update;
  }
}
