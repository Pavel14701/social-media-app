// infrastructure/mongoose/post-like.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { PostLike } from '../models/post-like.schema';
import { PostLikeDm } from '../../../domain/entities/post-like.entity';
import { IPostLikeRepository } from '../../../application/interfaces/post-like-repository.interface';

@Injectable()
export class PostLikeRepository
  extends BaseRepository<PostLikeDm, PostLike>
  implements IPostLikeRepository
{
  constructor(@InjectModel('postlike') private readonly postLikeModel: Model<PostLike>) {
    super(postLikeModel);
  }

  async create(entity: PostLikeDm): Promise<PostLikeDm> {
    const payload = this.toPersistence(entity);
    const doc = await this.postLikeModel.create(payload);
    return this.toDomain(doc);
  }

  async findByUser(userId: string): Promise<PostLikeDm[]> {
    const docs = await this.postLikeModel.find({ userId: new Types.ObjectId(userId) }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByPost(postId: string): Promise<PostLikeDm[]> {
    const docs = await this.postLikeModel.find({ postId: new Types.ObjectId(postId) }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async exists(postId: string, userId: string): Promise<boolean> {
    const doc = await this.postLikeModel.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    }).exec();
    return !!doc;
  }

  async deleteByUserAndPost(postId: string, userId: string): Promise<void> {
    await this.postLikeModel
      .findOneAndDelete({ postId: new Types.ObjectId(postId), userId: new Types.ObjectId(userId) })
      .exec();
  }

  async deleteByPost(postId: string): Promise<void> {
    await this.postLikeModel.deleteMany({ postId: new Types.ObjectId(postId) }).exec();
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.postLikeModel.deleteMany({ userId: new Types.ObjectId(userId) }).exec();
  }

  async countByPost(postId: string): Promise<number> {
    return this.postLikeModel.countDocuments({ postId: new Types.ObjectId(postId) }).exec();
  }

  async countByUser(userId: string): Promise<number> {
    return this.postLikeModel.countDocuments({ userId: new Types.ObjectId(userId) }).exec();
  }

  async getTopLikers(limit: number): Promise<{ userId: string; count: number }[]> {
    const result = await this.postLikeModel.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ userId: r._id.toString(), count: r.count }));
  }

  async getTopLikedPosts(limit: number): Promise<{ postId: string; count: number }[]> {
    const result = await this.postLikeModel.aggregate([
      { $group: { _id: '$postId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ postId: r._id.toString(), count: r.count }));
  }

  async findByDateRange(start: Date, end: Date): Promise<PostLikeDm[]> {
    const docs = await this.postLikeModel.find({
      createdAt: { $gte: start, $lte: end }
    }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findPreview(postIds: string[]): Promise<Map<string, string[]>> {
    const docs = await this.postLikeModel
      .find({ postId: { $in: postIds.map((id) => new Types.ObjectId(id)) } })
      .limit(200)
      .populate('userId', 'username')
      .exec();

    const map = new Map<string, string[]>();
    docs.forEach((doc: any) => {
      const pid = doc.postId.toString();
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(doc.userId.username);
    });
    return map;
  }

  protected toDomain(doc: PostLike): PostLikeDm {
    return new PostLikeDm(
      doc._id.toString(),
      doc.postId.toString(),
      doc.userId.toString(),
      doc.type,
      doc.source,
      doc.weight,
      doc.metadata,
      doc.ipAddress,
      doc.deviceId,
      doc.sessionId,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toPersistence(entity: Partial<PostLikeDm>): Partial<PostLike> {
    const update: Partial<PostLike> = {};
    if (entity.postId) update.postId = new Types.ObjectId(entity.postId);
    if (entity.userId) update.userId = new Types.ObjectId(entity.userId);
    if (entity.type !== undefined) update.type = entity.type;
    if (entity.source !== undefined) update.source = entity.source;
    if (entity.weight !== undefined) update.weight = entity.weight;
    if (entity.metadata !== undefined) update.metadata = entity.metadata;
    if (entity.ipAddress !== undefined) update.ipAddress = entity.ipAddress;
    if (entity.deviceId !== undefined) update.deviceId = entity.deviceId;
    if (entity.sessionId !== undefined) update.sessionId = entity.sessionId;
    return update;
  }
}
