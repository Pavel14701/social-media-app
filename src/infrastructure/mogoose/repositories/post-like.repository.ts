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

  async countByPost(postId: string): Promise<number> {
    return this.postLikeModel.countDocuments({ postId: new Types.ObjectId(postId) }).exec();
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
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toPersistence(entity: Partial<PostLikeDm>): Partial<PostLike> {
    const update: Partial<PostLike> = {};
    if (entity.postId) update.postId = new Types.ObjectId(entity.postId);
    if (entity.userId) update.userId = new Types.ObjectId(entity.userId);
    return update;
  }
}
