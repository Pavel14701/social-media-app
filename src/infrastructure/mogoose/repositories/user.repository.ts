// infrastructure/mongoose/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { User } from '../models/user.schema';
import { IUserRepository } from '../../../application/interfaces/user-repository.interface';
import { UserDm } from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepository
  extends BaseRepository<UserDm, User>
  implements IUserRepository
{
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }

  protected toDomain(doc: User): UserDm {
    return UserDm.fromDoc(doc);
  }


  protected toPersistence(entity: Partial<UserDm>): Partial<User> {
    const update: Partial<User> = {};
    if (entity.username !== undefined) update.username = entity.username;
    if (entity.email !== undefined) update.email = entity.email;
    if (entity.passwordHash !== undefined) update.passwordHash = entity.passwordHash;
    if (entity.biography !== undefined) update.biography = entity.biography;
    if (entity.isAdmin !== undefined) update.isAdmin = entity.isAdmin;
    if (entity.firstName !== undefined) update.firstName = entity.firstName;
    if (entity.lastName !== undefined) update.lastName = entity.lastName;
    if (entity.phoneNumber !== undefined) update.phoneNumber = entity.phoneNumber;
    if (entity.avatarUrl !== undefined) update.avatarUrl = entity.avatarUrl;
    if (entity.roles !== undefined) update.roles = entity.roles;
    if (entity.status !== undefined) update.status = entity.status;
    if (entity.lastLoginAt !== undefined) update.lastLoginAt = entity.lastLoginAt;
    if (entity.lastSeenAt !== undefined) update.lastSeenAt = entity.lastSeenAt;
    if (entity.isActive !== undefined) update.isActive = entity.isActive;
    if (entity.conversations) update.conversations = entity.conversations.map(id => new Types.ObjectId(id)) as any;
    if (entity.friends) update.friends = entity.friends.map(id => new Types.ObjectId(id)) as any;
    if (entity.followers) update.followers = entity.followers.map(id => new Types.ObjectId(id)) as any;
    if (entity.following) update.following = entity.following.map(id => new Types.ObjectId(id)) as any;
    if (entity.notificationsEnabled !== undefined) update.notificationsEnabled = entity.notificationsEnabled;
    if (entity.preferences !== undefined) update.preferences = entity.preferences as any;
    if (entity.security !== undefined) update.security = entity.security as any;
    if (entity.verified !== undefined) update.verified = entity.verified;
    if (entity.birthDate !== undefined) update.birthDate = entity.birthDate;
    if (entity.gender !== undefined) update.gender = entity.gender;
    if (entity.addresses !== undefined) update.addresses = entity.addresses as any;
    if (entity.auditLog !== undefined) update.auditLog = entity.auditLog as any;
    if (entity.metadata !== undefined) update.metadata = entity.metadata as any;
    return update;
  }

  // --- IUserRepository methods ---
  async create(entity: UserDm): Promise<UserDm> {
    const payload = this.toPersistence(entity);
    const doc = await this.userModel.create(payload);
    return this.toDomain(doc);
  }

  async findByEmail(email: string): Promise<UserDm | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByUsername(username: string): Promise<UserDm | null> {
    const doc = await this.userModel.findOne({ username }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByPhone(phone: string): Promise<UserDm | null> {
    const doc = await this.userModel.findOne({ phoneNumber: phone }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByStatus(status: string): Promise<UserDm[]> {
    const docs = await this.userModel.find({ status }).exec();
    return docs.map(d => this.toDomain(d));
  }

  async findActive(limit = 50): Promise<UserDm[]> {
    const docs = await this.userModel.find({ isActive: true }).limit(limit).exec();
    return docs.map(d => this.toDomain(d));
  }

  async findAdmins(): Promise<UserDm[]> {
    const docs = await this.userModel.find({ isAdmin: true }).exec();
    return docs.map(d => this.toDomain(d));
  }

  async findVerified(): Promise<UserDm[]> {
    const docs = await this.userModel.find({ verified: true }).exec();
    return docs.map(d => this.toDomain(d));
  }

  async findByRole(role: string): Promise<UserDm[]> {
    const docs = await this.userModel.find({ roles: role }).exec();
    return docs.map(d => this.toDomain(d));
  }

  async searchByName(keyword: string, limit = 20): Promise<UserDm[]> {
    const docs = await this.userModel.find({
      $or: [
        { firstName: { $regex: keyword, $options: 'i' } },
        { lastName: { $regex: keyword, $options: 'i' } },
        { username: { $regex: keyword, $options: 'i' } }
      ]
    }).limit(limit).exec();
    return docs.map(d => this.toDomain(d));
  }

  async searchByBiography(keyword: string, limit = 20): Promise<UserDm[]> {
    const docs = await this.userModel.find({ biography: { $regex: keyword, $options: 'i' } }).limit(limit).exec();
    return docs.map(d => this.toDomain(d));
  }

  async getRecentlyActive(limit = 20): Promise<UserDm[]> {
    const docs = await this.userModel.find({ lastSeenAt: { $exists: true } })
      .sort({ lastSeenAt: -1 })
      .limit(limit)
      .exec();
    return docs.map(d => this.toDomain(d));
  }

  async getRecentLogins(limit = 20): Promise<UserDm[]> {
    const docs = await this.userModel.find({ lastLoginAt: { $exists: true } })
      .sort({ lastLoginAt: -1 })
      .limit(limit)
      .exec();
    return docs.map(d => this.toDomain(d));
  }

  async updateLastSeen(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(new Types.ObjectId(userId), { lastSeenAt: new Date() }).exec();
  }

  async deactivate(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(new Types.ObjectId(userId), { isActive: false, status: 'banned' }).exec();
  }

  async countByStatus(status: string): Promise<number> {
    return this.userModel.countDocuments({ status }).exec();
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $addToSet: { friends: new Types.ObjectId(friendId) } }
    ).exec();
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $pull: { friends: new Types.ObjectId(friendId) } }
    ).exec();
  }

  async followUser(userId: string, targetId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $addToSet: { following: new Types.ObjectId(targetId) } }
    ).exec();

    await this.userModel.updateOne(
      { _id: new Types.ObjectId(targetId) },
      { $addToSet: { followers: new Types.ObjectId(userId) } }
    ).exec();
  }

  async unfollowUser(userId: string, targetId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $pull: { following: new Types.ObjectId(targetId) } }
    ).exec();

    await this.userModel.updateOne(
      { _id: new Types.ObjectId(targetId) },
      { $pull: { followers: new Types.ObjectId(userId) } }
    ).exec();
  }

  // --- Дополнительные методы из IUserRepository ---

  async findAll(): Promise<UserDm[]> {
    const docs = await this.userModel.find().exec();
    return docs.map(d => this.toDomain(d));
  }

  async findById(id: string): Promise<UserDm | null> {
    const doc = await this.userModel.findById(new Types.ObjectId(id)).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(id: string, entity: Partial<UserDm>): Promise<UserDm | null> {
    const payload = this.toPersistence(entity);
    const doc = await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: payload },
      { new: true }
    ).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
  }

}
