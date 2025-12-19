// infrastructure/mongoose/conversation.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IConversationRepository } from '../../../application/interfaces/conversation-repository.interface';
import { Conversation } from '../models/conversation.schema';
import { ConversationDm } from '../../../domain/entities/conversation.entity';

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
    const doc = await this.conversationModel
      .findOne({ recipients: { $all: userIds } })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async updateLastMessageAt(conversationId: string): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(
      conversationId,
      { lastMessageAt: new Date() },
      { new: true }
    ).exec();
  }

  async findByUser(userId: string): Promise<ConversationDm[]> {
    const docs = await this.conversationModel
      .find({ recipients: { $in: [userId] } })
      .sort('-updatedAt')
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async existsBetween(userIds: string[]): Promise<boolean> {
    const doc = await this.conversationModel.findOne({ recipients: { $all: userIds } }).exec();
    return !!doc;
  }

  async countByUser(userId: string): Promise<number> {
    return this.conversationModel.countDocuments({ recipients: { $in: [userId] } }).exec();
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.conversationModel.deleteMany({ recipients: { $in: [userId] } }).exec();
  }

  protected toDomain(doc: Conversation): ConversationDm {
    return new ConversationDm(
      doc._id.toString(),
      doc.recipients.map((r) => r.toString()),
      doc.lastMessageAt ?? undefined,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toPersistence(entity: Partial<ConversationDm>): Partial<Conversation> {
    const update: Partial<Conversation> = {};
    if (entity.recipients) {
      update.recipients = entity.recipients.map((id) => new Types.ObjectId(id));
    }
    if (entity.lastMessageAt !== undefined) {
      update.lastMessageAt = entity.lastMessageAt;
    }
    return update;
  }
}
