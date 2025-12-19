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



  async findByConversation(
    conversationId: string,
    limit = 12,
    anchor?: string
  ): Promise<MessageDm[]> {
    const filter: any = { conversation: new Types.ObjectId(conversationId) };

    if (anchor) {
      filter._id = { $gt: new Types.ObjectId(anchor) };
    }

    const docs = await this.messageModel
      .find(filter)
      .populate('sender', '-password')
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

  async findRecent(conversationId: string, limit: number): Promise<MessageDm[]> {
    const docs = await this.messageModel
      .find({ conversation: new Types.ObjectId(conversationId) })
      .sort('-createdAt')
      .limit(limit)
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async countByConversation(conversationId: string): Promise<number> {
    return this.messageModel.countDocuments({ conversation: new Types.ObjectId(conversationId) }).exec();
  }

  async deleteByConversation(conversationId: string): Promise<void> {
    await this.messageModel.deleteMany({ conversation: new Types.ObjectId(conversationId) }).exec();
  }

  async updateContent(messageId: string, newContent: string): Promise<MessageDm | null> {
    const doc = await this.messageModel.findByIdAndUpdate(
      messageId,
      { content: newContent },
      { new: true }
    ).exec();
    return doc ? this.toDomain(doc) : null;
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

  protected toDomain(doc: Message): MessageDm {
    return new MessageDm(
      doc._id.toString(),
      doc.conversation.toString(),
      doc.sender.toString(),
      doc.content,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toPersistence(entity: Partial<MessageDm>): Partial<Message> {
    const update: Partial<Message> = {};
    if (entity.conversationId) update.conversation = new Types.ObjectId(entity.conversationId);
    if (entity.senderId) update.sender = new Types.ObjectId(entity.senderId);
    if (entity.content !== undefined) update.content = entity.content;
    return update;
  }
}
