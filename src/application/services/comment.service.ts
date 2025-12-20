import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommentRepository } from '../interfaces/comment-repository.interface';
import type { IContentFilter } from '../interfaces/content-filter.interface';
import { CommentDm } from '../../domain/entities/comment.entity';

const cooldown = new Set<string>();

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepo: ICommentRepository,
    private readonly contentFilter: IContentFilter,
  ) {}

  /** Создание комментария с антиспамом и запретом грязи */
  async createComment(dto: {
    commenterId: string;
    targetId: string;
    targetType: 'post' | 'message' | 'comment';
    content: string;
    parent?: string;
  }): Promise<CommentDm> {
    if (!dto.content?.trim()) throw new BadRequestException('Content is required');

    if (cooldown.has(dto.commenterId)) {
      throw new BadRequestException('Too frequent commenting');
    }
    cooldown.add(dto.commenterId);
    setTimeout(() => cooldown.delete(dto.commenterId), 30000);

    if (this.contentFilter.isProfane(dto.content)) {
      throw new BadRequestException('Comment contains prohibited language');
    }

    return this.commentRepo.create(new CommentDm(dto));
  }

  /** Получение комментариев по целям */
  async getCommentsByPost(postId: string) {
    return this.commentRepo.findByPost(postId);
  }

  async getCommentsByMessage(messageId: string) {
    return this.commentRepo.findByMessage(messageId);
  }

  async getCommentsByComment(commentId: string) {
    return this.commentRepo.findByComment(commentId);
  }

  async getCommentsByUser(userId: string) {
    return this.commentRepo.findByUser(userId);
  }

  async getReplies(parentId: string) {
    return this.commentRepo.findReplies(parentId);
  }

  /** Обновление контента */
  async updateComment(commentId: string, content: string): Promise<CommentDm> {
    if (!content?.trim()) throw new BadRequestException('Content required');
    if (this.contentFilter.isProfane(content)) {
      throw new BadRequestException('Comment contains prohibited language');
    }
    const updated = await this.commentRepo.updateContent(commentId, content);
    if (!updated) throw new NotFoundException('Comment not found');
    return updated;
  }

  /** Удаление */
  async deleteComment(commentId: string) {
    await this.commentRepo.deleteComment(commentId);
  }

  async deleteByPost(postId: string) {
    await this.commentRepo.deleteByPost(postId);
  }

  async deleteByMessage(messageId: string) {
    await this.commentRepo.deleteByMessage(messageId);
  }

  async deleteByComment(commentId: string) {
    await this.commentRepo.deleteByComment(commentId);
  }

  /** Подсчёты */
  async countByPost(postId: string) {
    return this.commentRepo.countByPost(postId);
  }

  async countByMessage(messageId: string) {
    return this.commentRepo.countByMessage(messageId);
  }

  async countByComment(commentId: string) {
    return this.commentRepo.countByComment(commentId);
  }

  async countByUser(userId: string) {
    return this.commentRepo.countByUser(userId);
  }

  async countReactions(commentId: string) {
    return this.commentRepo.countReactions(commentId);
  }

  async countByReactionType(commentId: string, type: string) {
    return this.commentRepo.countByReactionType(commentId, type);
  }

  /** Реакции */
  async addReaction(commentId: string, userId: string, type: string) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.reactions.some(r => r.userId === userId)) {
      throw new BadRequestException('Already reacted');
    }
    await this.commentRepo.addReaction(commentId, userId, type);
  }

  async removeReaction(commentId: string, userId: string) {
    await this.commentRepo.removeReaction(commentId, userId);
  }

  /** Модерация */
  async flagComment(commentId: string, reason: string) {
    if (!reason?.trim()) throw new BadRequestException('Reason required');
    await this.commentRepo.flagComment(commentId, reason);
  }

  /** Аналитика */
  async getTopCommenters(limit = 10) {
    return this.commentRepo.getTopCommenters(limit);
  }

  async getMostRepliedComments(limit = 10) {
    return this.commentRepo.getMostRepliedComments(limit);
  }

  async getMostReactedComments(limit = 10) {
    return this.commentRepo.getMostReactedComments(limit);
  }

  /** Временные и приоритетные */
  async findByDateRange(start: Date, end: Date) {
    return this.commentRepo.findByDateRange(start, end);
  }

  async updateSource(commentId: string, source: string) {
    await this.commentRepo.updateSource(commentId, source);
  }

  async updateMetadata(commentId: string, metadata: Record<string, any>) {
    await this.commentRepo.updateMetadata(commentId, metadata);
  }

  async updateDeviceInfo(commentId: string, ipAddress?: string, deviceId?: string) {
    await this.commentRepo.updateDeviceInfo(commentId, ipAddress, deviceId);
  }

  async setExpiration(commentId: string, expiresAt: Date) {
    await this.commentRepo.setExpiration(commentId, expiresAt);
  }

  async updatePriority(commentId: string, priority: number) {
    await this.commentRepo.updatePriority(commentId, priority);
  }

  async findExpired() {
    return this.commentRepo.findExpired();
  }

  async findByPriority(minPriority: number) {
    return this.commentRepo.findByPriority(minPriority);
  }
}
