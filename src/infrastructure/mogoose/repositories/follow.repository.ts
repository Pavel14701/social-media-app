import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Follow } from '../models/follow.schema';
import { FollowDm } from '../../../domain/entities/follow.entity';
import { IFollowRepository } from '../../../application/interfaces/follow-repository.interface';

@Injectable()
export class FollowRepository
  extends BaseRepository<FollowDm, Follow>
  implements IFollowRepository
{
  constructor(@InjectModel('follow') private readonly followModel: Model<Follow>) {
    super(followModel);
  }

  async create(entity: FollowDm): Promise<FollowDm> {
    const payload = this.toPersistence(entity);
    const doc = await this.followModel.create(payload);
    return this.toDomain(doc);
  }

  async findFollowers(userId: string): Promise<FollowDm[]> {
    const docs = await this.followModel.find({ followingId: new Types.ObjectId(userId) }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findFollowing(userId: string): Promise<FollowDm[]> {
    const docs = await this.followModel.find({ userId: new Types.ObjectId(userId) }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async exists(userId: string, followingId: string): Promise<boolean> {
    const doc = await this.followModel.findOne({
      userId: new Types.ObjectId(userId),
      followingId: new Types.ObjectId(followingId),
    }).exec();
    return !!doc;
  }

  async deleteFollow(userId: string, followingId: string): Promise<void> {
    await this.followModel
      .findOneAndDelete({ userId: new Types.ObjectId(userId), followingId: new Types.ObjectId(followingId) })
      .exec();
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.followModel.deleteMany({ userId: new Types.ObjectId(userId) }).exec();
  }

  async deleteByFollowing(followingId: string): Promise<void> {
    await this.followModel.deleteMany({ followingId: new Types.ObjectId(followingId) }).exec();
  }

  async countFollowers(userId: string): Promise<number> {
    return this.followModel.countDocuments({ followingId: new Types.ObjectId(userId), status: 'active' }).exec();
  }

  async countFollowing(userId: string): Promise<number> {
    return this.followModel.countDocuments({ userId: new Types.ObjectId(userId), status: 'active' }).exec();
  }

  async findMutual(userId: string): Promise<FollowDm[]> {
    const docs = await this.followModel.find({ userId: new Types.ObjectId(userId), mutual: true }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByStatus(userId: string, status: string): Promise<FollowDm[]> {
    const docs = await this.followModel.find({ userId: new Types.ObjectId(userId), status }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async getTopFollowed(limit: number): Promise<{ userId: string; count: number }[]> {
    const result = await this.followModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$followingId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ userId: r._id.toString(), count: r.count }));
  }

  async getTopFollowing(limit: number): Promise<{ userId: string; count: number }[]> {
    const result = await this.followModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ userId: r._id.toString(), count: r.count }));
  }

  async findByDateRange(start: Date, end: Date): Promise<FollowDm[]> {
    const docs = await this.followModel.find({
      createdAt: { $gte: start, $lte: end }
    }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

protected toDomain(doc: Follow): FollowDm {
  return FollowDm.fromDoc(doc);
}


  protected toPersistence(entity: Partial<FollowDm>): Partial<Follow> {
    const update: Partial<Follow> = {};
    if (entity.userId) update.userId = new Types.ObjectId(entity.userId);
    if (entity.followingId) update.followingId = new Types.ObjectId(entity.followingId);
    if (entity.status !== undefined) update.status = entity.status;
    if (entity.mutual !== undefined) update.mutual = entity.mutual;
    if (entity.notificationsEnabled !== undefined) update.notificationsEnabled = entity.notificationsEnabled;
    if (entity.metadata !== undefined) update.metadata = entity.metadata;
    if (entity.source !== undefined) update.source = entity.source;
    if (entity.ipAddress !== undefined) update.ipAddress = entity.ipAddress;
    if (entity.deviceId !== undefined) update.deviceId = entity.deviceId;
    if (entity.expiresAt !== undefined) update.expiresAt = entity.expiresAt;
    if (entity.priority !== undefined) update.priority = entity.priority;
    return update;
  }
}
