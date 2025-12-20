import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Comment } from '../models/comment.schema';
import { CommentDm } from '../../../domain/entities/comment.entity';
import { ICommentRepository } from '../../../application/interfaces/comment-repository.interface';


@Injectable()
export class CommentRepository
  extends BaseRepository<CommentDm, Comment>
  implements ICommentRepository
{
  constructor(@InjectModel('comment') private readonly commentModel: Model<Comment>) {
    super(commentModel);
  }

  async create(entity: CommentDm): Promise<CommentDm> {
    const payload = this.toPersistence(entity);
    const doc = await this.commentModel.create(payload);
    return this.toDomain(doc);
  }

  async findByPost(postId: string): Promise<CommentDm[]> {
    const docs = await this.commentModel.find({ post: new Types.ObjectId(postId) }).sort('createdAt').exec();
    return docs.map(this.toDomain);
  }

  async findByMessage(messageId: string): Promise<CommentDm[]> {
    const docs = await this.commentModel.find({ message: new Types.ObjectId(messageId) }).sort('createdAt').exec();
    return docs.map(this.toDomain);
  }

  async findByComment(commentId: string): Promise<CommentDm[]> {
    const docs = await this.commentModel.find({ parent: new Types.ObjectId(commentId) }).sort('createdAt').exec();
    return docs.map(this.toDomain);
  }

  async findByUser(userId: string): Promise<CommentDm[]> {
    const docs = await this.commentModel.find({ commenter: new Types.ObjectId(userId) }).sort('-createdAt').exec();
    return docs.map(this.toDomain);
  }

  async findReplies(parentId: string): Promise<CommentDm[]> {
    const docs = await this.commentModel.find({ parent: new Types.ObjectId(parentId) }).sort('createdAt').exec();
    return docs.map(this.toDomain);
  }

  async updateContent(commentId: string, newContent: string): Promise<CommentDm | null> {
    const doc = await this.commentModel.findByIdAndUpdate(
      commentId,
      { content: newContent, edited: true },
      { new: true }
    ).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.commentModel.findByIdAndDelete(commentId).exec();
  }

  async deleteByPost(postId: string): Promise<void> {
    await this.commentModel.deleteMany({ post: new Types.ObjectId(postId) }).exec();
  }

  async deleteByMessage(messageId: string): Promise<void> {
    await this.commentModel.deleteMany({ message: new Types.ObjectId(messageId) }).exec();
  }

  async deleteByComment(commentId: string): Promise<void> {
    await this.commentModel.deleteMany({ parent: new Types.ObjectId(commentId) }).exec();
  }

  async countByPost(postId: string): Promise<number> {
    return this.commentModel.countDocuments({ post: new Types.ObjectId(postId) }).exec();
  }

  async countByMessage(messageId: string): Promise<number> {
    return this.commentModel.countDocuments({ message: new Types.ObjectId(messageId) }).exec();
  }

  async countByComment(commentId: string): Promise<number> {
    return this.commentModel.countDocuments({ parent: new Types.ObjectId(commentId) }).exec();
  }

  async countByUser(userId: string): Promise<number> {
    return this.commentModel.countDocuments({ commenter: new Types.ObjectId(userId) }).exec();
  }

  async addReaction(commentId: string, userId: string, type: string): Promise<void> {
    await this.commentModel.updateOne(
      { _id: new Types.ObjectId(commentId) },
      { $addToSet: { reactions: { userId: new Types.ObjectId(userId), type } } }
    ).exec();
  }

  async removeReaction(commentId: string, userId: string): Promise<void> {
    await this.commentModel.updateOne(
      { _id: new Types.ObjectId(commentId) },
      { $pull: { reactions: { userId: new Types.ObjectId(userId) } } }
    ).exec();
  }

  async countReactions(commentId: string): Promise<number> {
    const doc = await this.commentModel.findById(commentId).exec();
    return doc ? doc.reactions.length : 0;
  }

  async countByReactionType(commentId: string, type: string): Promise<number> {
    const doc = await this.commentModel.findById(commentId).exec();
    return doc ? doc.reactions.filter(r => r.type === type).length : 0;
  }

  async flagComment(commentId: string, reason: string): Promise<void> {
    await this.commentModel.findByIdAndUpdate(
      commentId,
      { flagged: true, $push: { reportReasons: reason } }
    ).exec();
  }

  async getTopCommenters(limit: number): Promise<{ userId: string; count: number }[]> {
    const result = await this.commentModel.aggregate([
      { $group: { _id: '$commenter', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ userId: r._id.toString(), count: r.count }));
  }

  async getMostRepliedComments(limit: number): Promise<{ commentId: string; replies: number }[]> {
    const result = await this.commentModel.aggregate([
      { $project: { replies: { $size: '$children' } } },
      { $sort: { replies: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ commentId: r._id.toString(), replies: r.replies }));
  }

  async getMostReactedComments(limit: number): Promise<{ commentId: string; reactions: number }[]> {
    const result = await this.commentModel.aggregate([
      { $project: { reactions: { $size: '$reactions' } } },
      { $sort: { reactions: -1 } },
      { $limit: limit }
    ]);
    return result.map(r => ({ commentId: r._id.toString(), reactions: r.reactions }));
  }

  async findByDateRange(start: Date, end: Date): Promise<CommentDm[]> {
    const docs = await this.commentModel.find({
      createdAt: { $gte: start, $lte: end }
    }).exec();
    return docs.map(this.toDomain);
  }

async updateSource(commentId: string, source: string): Promise<void> {
  await this.commentModel.findByIdAndUpdate(commentId, { source }).exec();
}

async updateMetadata(commentId: string, metadata: Record<string, any>): Promise<void> {
  await this.commentModel.findByIdAndUpdate(commentId, { metadata }).exec();
}

async updateDeviceInfo(commentId: string, ipAddress?: string, deviceId?: string): Promise<void> {
  await this.commentModel.findByIdAndUpdate(commentId, { ipAddress, deviceId }).exec();
}

async setExpiration(commentId: string, expiresAt: Date): Promise<void> {
  await this.commentModel.findByIdAndUpdate(commentId, { expiresAt }).exec();
}

async updatePriority(commentId: string, priority: number): Promise<void> {
  await this.commentModel.findByIdAndUpdate(commentId, { priority }).exec();
}

async findExpired(): Promise<CommentDm[]> {
  const now = new Date();
  const docs = await this.commentModel.find({ expiresAt: { $lte: now } }).exec();
  return docs.map(this.toDomain);
}

async findByPriority(minPriority: number): Promise<CommentDm[]> {
  const docs = await this.commentModel.find({ priority: { $gte: minPriority } }).exec();
  return docs.map(this.toDomain);
}


  protected toDomain(doc: Comment): CommentDm {
    return CommentDm.fromDoc(doc);
  }

  protected toPersistence(entity: Partial<CommentDm>): Partial<Comment> {
    const update: Partial<Comment> = {};

    if (entity.commenterId) {
        update.commenter = new Types.ObjectId(entity.commenterId);
    }

    // универсальная цель
    if (entity.targetId) {
        update.targetId = new Types.ObjectId(entity.targetId);
    }
    if (entity.targetType) {
        update.targetType = entity.targetType;
    }

    if (entity.content !== undefined) {
        update.content = entity.content;
    }

    if (entity.parent) {
        update.parent = new Types.ObjectId(entity.parent);
    }

    if (entity.children) {
        update.children = entity.children.map((id) => new Types.ObjectId(id));
    }

    if (entity.reactions) {
        update.reactions = entity.reactions.map((r) => ({
        userId: new Types.ObjectId(r.userId),
        type: r.type,
        }));
    }

    if (entity.edited !== undefined) update.edited = entity.edited;
    if (entity.flagged !== undefined) update.flagged = entity.flagged;
    if (entity.reportReasons !== undefined) update.reportReasons = entity.reportReasons;
    if (entity.mentions !== undefined) update.mentions = entity.mentions;
    if (entity.attachments !== undefined) update.attachments = entity.attachments;
    if (entity.status !== undefined) update.status = entity.status;

    // новые поля
    if (entity.source !== undefined) update.source = entity.source;
    if (entity.metadata !== undefined) update.metadata = entity.metadata;
    if (entity.ipAddress !== undefined) update.ipAddress = entity.ipAddress;
    if (entity.deviceId !== undefined) update.deviceId = entity.deviceId;
    if (entity.expiresAt !== undefined) update.expiresAt = entity.expiresAt;
    if (entity.priority !== undefined) update.priority = entity.priority;

    return update;
    }

}
