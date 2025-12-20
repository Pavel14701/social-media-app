// infrastructure/mongoose/message.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IMessageRepository } from '../../../application/interfaces/message-repository.interface';
import { MessageDm } from '../../../domain/entities/message.entity';
import { Message } from '../models/message.schema';

@Injectable()
export class MessageRepository
  extends BaseRepository<MessageDm, Message>
  implements IMessageRepository
{
  constructor(@InjectModel('message') private readonly messageModel: Model<Message>) {
    super(messageModel);
  }

  async create(entity: MessageDm): Promise<MessageDm> {
    const payload = this.toPersistence(entity);
    const doc = await this.messageModel.create(payload);
    return this.toDomain(doc);
  }

  async findRecent(conversationId: string, limit: number): Promise<MessageDm[]> {
    const docs = await this.messageModel
      .find({ conversation: new Types.ObjectId(conversationId) })
      .sort('-createdAt')
      .limit(limit)
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async deleteByConversation(conversationId: string): Promise<void> {
    await this.messageModel.deleteMany({ conversation: new Types.ObjectId(conversationId) }).exec();
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.messageModel.findByIdAndDelete(messageId).exec();
  }

  async searchInConversation(conversationId: string, keyword: string): Promise<MessageDm[]> {
    const docs = await this.messageModel
      .find({
        conversation: new Types.ObjectId(conversationId),
        content: { $regex: keyword, $options: 'i' },
      })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findRecentBySender(userId: string, limit: number): Promise<MessageDm[]> {
    const docs = await this.messageModel
      .find({ sender: new Types.ObjectId(userId) })
      .sort('-createdAt')
      .limit(limit)
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async countBySender(userId: string): Promise<number> {
    return this.messageModel.countDocuments({ sender: new Types.ObjectId(userId) }).exec();
  }

  async findByConversation(conversationId: string, limit = 20, anchor?: string): Promise<MessageDm[]> {
    const filter: any = { conversation: new Types.ObjectId(conversationId) };
    if (anchor) filter._id = { $gt: new Types.ObjectId(anchor) };

    const docs = await this.messageModel
      .find(filter)
      .populate('sender', '-password')
      .sort('-createdAt')
      .limit(limit)
      .exec();

    return docs.map((doc) => this.toDomain(doc));
  }

  async paginateBackward(conversationId: string, anchor: string, limit: number): Promise<MessageDm[]> {
    const docs = await this.messageModel
      .find({ conversation: new Types.ObjectId(conversationId), _id: { $lt: new Types.ObjectId(anchor) } })
      .sort('-createdAt')
      .limit(limit)
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findBySender(userId: string): Promise<MessageDm[]> {
    const docs = await this.messageModel
      .find({ sender: new Types.ObjectId(userId) })
      .sort('-createdAt')
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findLastMessage(conversationId: string): Promise<MessageDm | null> {
    const doc = await this.messageModel
      .findOne({ conversation: new Types.ObjectId(conversationId) })
      .sort('-createdAt')
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async countByConversation(conversationId: string): Promise<number> {
    return this.messageModel.countDocuments({ conversation: new Types.ObjectId(conversationId) }).exec();
  }

  async countUnread(conversationId: string, userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      conversation: new Types.ObjectId(conversationId),
      sender: { $ne: new Types.ObjectId(userId) },
      read: false,
    }).exec();
  }

  async updateContent(messageId: string, newContent: string): Promise<MessageDm | null> {
    const doc = await this.messageModel.findByIdAndUpdate(
      messageId,
      { content: newContent, edited: true },
      { new: true }
    ).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async softDelete(messageId: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(messageId, { deleted: true }).exec();
  }

  async restoreMessage(messageId: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(messageId, { deleted: false }).exec();
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageModel.updateMany(
      { conversation: new Types.ObjectId(conversationId), sender: { $ne: new Types.ObjectId(userId) } },
      { $set: { read: true } }
    ).exec();
  }

  async findReplies(messageId: string): Promise<MessageDm[]> {
    const docs = await this.messageModel.find({ replyTo: new Types.ObjectId(messageId) }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByThread(threadId: string): Promise<MessageDm[]> {
    const docs = await this.messageModel.find({ threadId: new Types.ObjectId(threadId) }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findForwarded(fromMessageId: string): Promise<MessageDm[]> {
    const docs = await this.messageModel.find({ forwardedFrom: new Types.ObjectId(fromMessageId) }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByMention(userId: string): Promise<MessageDm[]> {
    const docs = await this.messageModel.find({ mentions: userId }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findExpired(): Promise<MessageDm[]> {
    const now = new Date();
    const docs = await this.messageModel.find({ expiresAt: { $lte: now } }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  protected toDomain(doc: Message): MessageDm {
    return new MessageDm(
      doc._id.toString(),
      doc.conversation.toString(),
      doc.sender.toString(),
      doc.content,
      doc.read,
      doc.attachments,
      doc.edited,
      doc.deleted,
      doc.replyTo ? doc.replyTo.toString() : undefined,
      doc.type,
      doc.reactions,
      doc.delivered,
      doc.seenBy?.map((id) => id.toString()) ?? [],
      doc.threadId ? doc.threadId.toString() : undefined,
      doc.forwardedFrom ? doc.forwardedFrom.toString() : undefined,
      doc.mentions,
      doc.priority,
      doc.expiresAt,
      doc.location,
      doc.language,
      doc.encrypted,
      doc.metadata,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toPersistence(entity: Partial<MessageDm>): Partial<Message> {
    const update: Partial<Message> = {};
    if (entity.conversationId) update.conversation = new Types.ObjectId(entity.conversationId);
    if (entity.senderId) update.sender = new Types.ObjectId(entity.senderId);
    if (entity.content !== undefined) update.content = entity.content;
    if (entity.read !== undefined) update.read = entity.read;
    if (entity.attachments !== undefined) update.attachments = entity.attachments;
    if (entity.edited !== undefined) update.edited = entity.edited;
    if (entity.deleted !== undefined) update.deleted = entity.deleted;
    if (entity.replyTo) update.replyTo = new Types.ObjectId(entity.replyTo);
    if (entity.type !== undefined) update.type = entity.type;
    if (entity.reactions !== undefined) update.reactions = entity.reactions;
    if (entity.delivered !== undefined) update.delivered = entity.delivered;
    if (entity.seenBy !== undefined) update.seenBy = entity.seenBy.map((id) => new Types.ObjectId(id));
    if (entity.threadId) update.threadId = new Types.ObjectId(entity.threadId);
    if (entity.forwardedFrom) update.forwardedFrom = new Types.ObjectId(entity.forwardedFrom);
    if (entity.mentions !== undefined) update.mentions = entity.mentions;
    if (entity.priority !== undefined) update.priority = entity.priority;
    if (entity.expiresAt !== undefined) update.expiresAt = entity.expiresAt;
    if (entity.location !== undefined) update.location = entity.location;
    if (entity.language !== undefined) update.language = entity.language;
    if (entity.encrypted !== undefined) update.encrypted = entity.encrypted;
    if (entity.metadata !== undefined) update.metadata = entity.metadata;
    return update;
  }
}
