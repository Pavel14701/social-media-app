// infrastructure/mongoose/follow.repository.ts
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

  async countFollowers(userId: string): Promise<number> {
    return this.followModel.countDocuments({ followingId: new Types.ObjectId(userId) }).exec();
  }

  async countFollowing(userId: string): Promise<number> {
    return this.followModel.countDocuments({ userId: new Types.ObjectId(userId) }).exec();
  }

  protected toDomain(doc: Follow): FollowDm {
    return new FollowDm(
      doc._id.toString(),
      doc.userId.toString(),
      doc.followingId.toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toPersistence(entity: Partial<FollowDm>): Partial<Follow> {
    const update: Partial<Follow> = {};
    if (entity.userId) update.userId = new Types.ObjectId(entity.userId);
    if (entity.followingId) update.followingId = new Types.ObjectId(entity.followingId);
    return update;
  }
}
