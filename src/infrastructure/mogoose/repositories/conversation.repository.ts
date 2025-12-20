import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Conversation } from '../models/conversation.schema';
import { ConversationDm } from '../../../domain/entities/conversation.entity';
import { IConversationRepository } from '../../../application/interfaces/conversation-repository.interface';

@Injectable()
export class ConversationRepository
  extends BaseRepository<ConversationDm, Conversation>
  implements IConversationRepository
{
  constructor(@InjectModel('conversation') private readonly conversationModel: Model<Conversation>) {
    super(conversationModel);
  }

  async create(entity: ConversationDm): Promise<ConversationDm> {
    const payload = this.toPersistence(entity);
    const doc = await this.conversationModel.create(payload);
    return this.toDomain(doc);
  }

  async findByParticipants(userIds: string[]): Promise<ConversationDm | null> {
    const objIds = userIds.map((id) => new Types.ObjectId(id));
    const doc = await this.conversationModel.findOne({ recipients: { $all: objIds } }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByUser(userId: string): Promise<ConversationDm[]> {
    const docs = await this.conversationModel.find({ recipients: new Types.ObjectId(userId) }).sort('-lastMessageAt').exec();
    return docs.map((d) => this.toDomain(d));
  }

  async existsBetween(userIds: string[]): Promise<boolean> {
    const objIds = userIds.map((id) => new Types.ObjectId(id));
    const doc = await this.conversationModel.findOne({ recipients: { $all: objIds } }).exec();
    return !!doc;
  }

  async updateLastMessageAt(conversationId: string): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() }).exec();
  }

  async updateLastMessage(conversationId: string, messageId: string): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessageId: new Types.ObjectId(messageId),
      lastMessageAt: new Date(),
      lastActivityAt: new Date(),
    }).exec();
  }

  async addRecipient(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $addToSet: { recipients: new Types.ObjectId(userId) } }
    ).exec();
    await this.logAction(conversationId, userId, 'added_recipient');
  }

  async removeRecipient(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $pull: { recipients: new Types.ObjectId(userId), admins: new Types.ObjectId(userId) } }
    ).exec();
    await this.logAction(conversationId, userId, 'removed_recipient');
  }

  async setAdmin(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $addToSet: { admins: new Types.ObjectId(userId) } }
    ).exec();
    await this.logAction(conversationId, userId, 'set_admin');
  }

  async removeAdmin(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $pull: { admins: new Types.ObjectId(userId) } }
    ).exec();
    await this.logAction(conversationId, userId, 'removed_admin');
  }

  async incrementUnread(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $inc: { [`unreadCounts.${userId}`]: 1 } }
    ).exec();
  }

  async resetUnread(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $set: { [`unreadCounts.${userId}`]: 0 } }
    ).exec();
  }

  async muteConversation(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $addToSet: { mutedUsers: new Types.ObjectId(userId) } }
    ).exec();
  }

  async unmuteConversation(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $pull: { mutedUsers: new Types.ObjectId(userId) } }
    ).exec();
  }

  async pinMessage(conversationId: string, messageId: string): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(conversationId, { pinnedMessageId: new Types.ObjectId(messageId) }).exec();
    await this.logAction(conversationId, null as any, 'pinned_message');
  }

  async unpinMessage(conversationId: string): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(conversationId, { $unset: { pinnedMessageId: '' } }).exec();
    await this.logAction(conversationId, null as any, 'unpinned_message');
  }

  async archive(conversationId: string): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(conversationId, { status: 'archived' }).exec();
  }

  async archiveForUser(conversationId: string, userId: string, until?: Date): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $addToSet: { archivedBy: { userId: new Types.ObjectId(userId), until } } }
    ).exec();
  }

  async countByUser(userId: string): Promise<number> {
    return this.conversationModel.countDocuments({ recipients: new Types.ObjectId(userId) }).exec();
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.conversationModel.deleteMany({ recipients: new Types.ObjectId(userId) }).exec();
  }

  async getTopActiveConversations(limit: number): Promise<{ id: string; count: number }[]> {
    const result = await this.conversationModel.aggregate([
      { $match: { lastMessageAt: { $exists: true } } },
      { $sort: { lastMessageAt: -1 } },
      { $limit: limit },
      { $project: { _id: 1, lastMessageAt: 1 } }
    ]);
    return result.map(r => ({ id: r._id.toString(), count: r.lastMessageAt ? 1 : 0 }));
  }

  async getConversationStats(conversationId: string): Promise<any> {
    const [conv] = await this.conversationModel.aggregate([
      { $match: { _id: new Types.ObjectId(conversationId) } },
      {
        $project: {
          recipients: 1,
          admins: 1,
          lastMessageAt: 1,
          unreadCounts: 1,
          pinnedMessageId: 1,
          status: 1,
          attachmentsIndex: 1,
        }
      }
    ]);
    return conv || null;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.resetUnread(conversationId, userId);
    await this.logAction(conversationId, userId, 'marked_read');
  }

  async setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    // typingUsers stored in customSettings.typingUsers as a simple approach
    const key = `customSettings.typingUsers.${userId}`;
    if (isTyping) {
      await this.conversationModel.updateOne(
        { _id: new Types.ObjectId(conversationId) },
        { $set: { [key]: new Date() } }
      ).exec();
    } else {
      await this.conversationModel.updateOne(
        { _id: new Types.ObjectId(conversationId) },
        { $unset: { [key]: '' } }
      ).exec();
    }
  }

  async updateSettings(conversationId: string, settings: Record<string, any>): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $set: { customSettings: settings } }
    ).exec();
  }

  async assignRole(conversationId: string, userId: string, role: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $addToSet: { roles: { userId: new Types.ObjectId(userId), role } } }
    ).exec();
    await this.logAction(conversationId, userId, `assigned_role:${role}`);
  }

  async inviteUser(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $addToSet: { invites: { userId: new Types.ObjectId(userId), invitedAt: new Date() } } }
    ).exec();
    await this.logAction(conversationId, userId, 'invited');
  }

  async blockUser(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $addToSet: { blockedUsers: new Types.ObjectId(userId) } }
    ).exec();
    await this.logAction(conversationId, userId, 'blocked_user');
  }

  async unblockUser(conversationId: string, userId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $pull: { blockedUsers: new Types.ObjectId(userId) } }
    ).exec();
    await this.logAction(conversationId, userId, 'unblocked_user');
  }

  async pinConversation(userId: string, conversationId: string): Promise<void> {
    // store per-user pinned conversations in customSettings.pinnedByUser.{userId} = true
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $set: { [`customSettings.pinnedByUser.${userId}`]: true } }
    ).exec();
  }

  async unpinConversation(userId: string, conversationId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $unset: { [`customSettings.pinnedByUser.${userId}`]: '' } }
    ).exec();
  }

  async setExpiration(conversationId: string, date: Date): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(conversationId, { expiresAt: date }).exec();
    await this.logAction(conversationId, null as any, `set_expiration:${date.toISOString()}`);
  }

  async logAction(conversationId: string, actorId: string, action: string): Promise<void> {
    const entry = { actor: actorId ? new Types.ObjectId(actorId) : null, action, at: new Date() } as any;
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $push: { auditLog: entry } }
    ).exec();
  }

  async getAuditLog(conversationId: string): Promise<{ actor: string; action: string; at: Date }[]> {
    const doc = await this.conversationModel.findById(conversationId, { auditLog: 1 }).exec();
    return (doc?.auditLog ?? []).map((a: any) => ({ actor: a.actor?.toString(), action: a.action, at: a.at }));
  }

  async attachFile(conversationId: string, fileId: string): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $addToSet: { attachmentsIndex: new Types.ObjectId(fileId) } }
    ).exec();
  }

  async findByType(type: string): Promise<ConversationDm[]> {
    const docs = await this.conversationModel.find({ conversationType: type }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async getExpiredConversations(): Promise<ConversationDm[]> {
    const now = new Date();
    const docs = await this.conversationModel.find({ expiresAt: { $lte: now } }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async getChannelsByUser(userId: string): Promise<ConversationDm[]> {
    const docs = await this.conversationModel.find({ conversationType: 'channel', recipients: new Types.ObjectId(userId) }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  // --- Analytics (examples using aggregation; actual message collection is external)
  async countMessages(conversationId: string): Promise<number> {
    // assumes messages stored in separate collection 'messages' with conversationId ref
    const res = await this.conversationModel.db.collection('messages').countDocuments({ conversationId: new Types.ObjectId(conversationId) });
    return res;
  }

  async getMostActiveUsers(conversationId: string, limit: number): Promise<{ userId: string; count: number }[]> {
    const pipeline = [
      { $match: { conversationId: new Types.ObjectId(conversationId) } },
      { $group: { _id: '$sender', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ];
    const result = await this.conversationModel.db.collection('messages').aggregate(pipeline).toArray();
    return result.map((r: any) => ({ userId: r._id.toString(), count: r.count }));
  }

  async averageResponseTime(conversationId: string): Promise<number | null> {
    // approximate: compute average difference between consecutive messages
    const pipeline = [
      { $match: { conversationId: new Types.ObjectId(conversationId) } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: null,
          times: { $push: '$createdAt' }
        }
      },
      {
        $project: {
          diffs: {
            $map: {
              input: { $range: [1, { $size: '$times' }] },
              as: 'i',
              in: { $subtract: [{ $arrayElemAt: ['$times', '$$i'] }, { $arrayElemAt: ['$times', { $subtract: ['$$i', 1] }] }] }
            }
          }
        }
      },
      { $unwind: '$diffs' },
      { $group: { _id: null, avg: { $avg: '$diffs' } } }
    ];
    const res = await this.conversationModel.db.collection('messages').aggregate(pipeline).toArray();
    if (!res || !res[0]) return null;
    return res[0].avg; // milliseconds
  }

  async userParticipationRate(conversationId: string): Promise<{ userId: string; percent: number }[]> {
    const total = await this.countMessages(conversationId);
    if (total === 0) return [];
    const users = await this.getMostActiveUsers(conversationId, 1000);
    return users.map(u => ({ userId: u.userId, percent: (u.count / total) * 100 }));
  }

  async conversationGrowthOverTime(conversationId: string, from: Date, to: Date): Promise<any> {
    const pipeline = [
      { $match: { conversationId: new Types.ObjectId(conversationId), createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
    const res = await this.conversationModel.db.collection('messages').aggregate(pipeline).toArray();
    return res;
  }

  async heatmapActivity(conversationId: string): Promise<any> {
    const pipeline = [
      { $match: { conversationId: new Types.ObjectId(conversationId) } },
      {
        $project: {
          hour: { $hour: '$createdAt' },
          day: { $dayOfWeek: '$createdAt' }
        }
      },
      {
        $group: {
          _id: { day: '$day', hour: '$hour' },
          count: { $sum: 1 }
        }
      }
    ];
    const res = await this.conversationModel.db.collection('messages').aggregate(pipeline).toArray();
    return res;
  }

  async supportEfficiency(conversationId: string): Promise<any> {
    // example: average time from first message to 'closed' event in messages or events collection
    const pipeline = [
      { $match: { conversationId: new Types.ObjectId(conversationId) } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$conversationId',
          first: { $first: '$createdAt' },
          closed: { $max: { $cond: [{ $eq: ['$type', 'closed'] }, '$createdAt', null] } }
        }
      },
      {
        $project: {
          duration: { $subtract: ['$closed', '$first'] }
        }
      }
    ];
    const res = await this.conversationModel.db.collection('messages').aggregate(pipeline).toArray();
    return res[0] ?? null;
  }

  protected toDomain(doc: Conversation): ConversationDm {
    return ConversationDm.fromDoc(doc);
  }

  protected toPersistence(entity: Partial<ConversationDm>): Partial<Conversation> {
    const update: Partial<Conversation> = {};
    if (entity.recipients) update.recipients = entity.recipients.map((id) => new Types.ObjectId(id));
    if (entity.isGroup !== undefined) update.isGroup = entity.isGroup;
    if (entity.title !== undefined) update.title = entity.title;
    if (entity.admins) update.admins = entity.admins.map((id) => new Types.ObjectId(id));
    if (entity.lastMessageId) update.lastMessageId = new Types.ObjectId(entity.lastMessageId);
    if (entity.lastMessageAt !== undefined) update.lastMessageAt = entity.lastMessageAt;
    if (entity.unreadCounts) {
      if (entity.unreadCounts instanceof Map) {
        update.unreadCounts = Object.fromEntries(Array.from(entity.unreadCounts.entries())) as any;
      } else {
        update.unreadCounts = entity.unreadCounts as any;
      }
    }
    if (entity.mutedUsers) update.mutedUsers = entity.mutedUsers.map((id) => new Types.ObjectId(id));
    if (entity.pinnedMessageId) update.pinnedMessageId = new Types.ObjectId(entity.pinnedMessageId);
    if (entity.status !== undefined) update.status = entity.status;
    if (entity.expiresAt !== undefined) update.expiresAt = entity.expiresAt;
    if (entity.tags) update.tags = entity.tags;
    if (entity.blockedUsers) update.blockedUsers = entity.blockedUsers.map((id) => new Types.ObjectId(id));
    if (entity.lastActivityAt !== undefined) update.lastActivityAt = entity.lastActivityAt;
    if (entity.auditLog) {
      update.auditLog = entity.auditLog.map(a => ({
        actor: a.actor ? new Types.ObjectId(a.actor) : undefined,
        action: a.action,
        at: a.at
      })).map((x) => {
        // убрать actor если undefined, чтобы соответствовать схеме
        if (x.actor === undefined) {
          const { actor, ...rest } = x as any;
          return rest;
        }
        return x;
      }) as any;
    }
    if (entity.roles) {
      update.roles = entity.roles.map(r => ({ userId: new Types.ObjectId(r.userId), role: r.role }));
    }
    if (entity.invites) {
      update.invites = entity.invites.map(i => ({ userId: new Types.ObjectId(i.userId), invitedAt: i.invitedAt }));
    }
    // archivedBy: не включаем поле until, если оно undefined
    if (entity.archivedBy) {
      update.archivedBy = entity.archivedBy.map(a => {
        const base: any = { userId: new Types.ObjectId(a.userId) };
        if (a.until !== undefined && a.until !== null) base.until = a.until;
        return base;
      }) as any;
    }
    // customSettings: Map или plain object
    if (entity.customSettings) {
      if (entity.customSettings instanceof Map) {
        update.customSettings = Object.fromEntries(Array.from(entity.customSettings.entries())) as any;
      } else {
        update.customSettings = entity.customSettings as any;
      }
    }
    if (entity.attachmentsIndex) update.attachmentsIndex = entity.attachmentsIndex.map((id) => new Types.ObjectId(id));
    if (entity.conversationType) update.conversationType = entity.conversationType;
    if (entity.priority !== undefined) update.priority = entity.priority;
    if (entity.integrationKeys) update.integrationKeys = entity.integrationKeys;
    if (entity.encrypted !== undefined) update.encrypted = entity.encrypted;
    return update;
  }

}