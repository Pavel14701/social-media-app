import { CommentDm } from "../../domain/entities/comment.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface ICommentRepository extends IBaseRepository<CommentDm> {
  create(entity: CommentDm): Promise<CommentDm>;

  // выборки
  findByPost(postId: string): Promise<CommentDm[]>;
  findByMessage(messageId: string): Promise<CommentDm[]>;
  findByComment(commentId: string): Promise<CommentDm[]>;
  findByUser(userId: string): Promise<CommentDm[]>;
  findReplies(parentId: string): Promise<CommentDm[]>;

  // обновление
  updateContent(commentId: string, newContent: string): Promise<CommentDm | null>;
  updateSource(commentId: string, source: string): Promise<void>;
  updateMetadata(commentId: string, metadata: Record<string, any>): Promise<void>;
  updateDeviceInfo(commentId: string, ipAddress?: string, deviceId?: string): Promise<void>;
  setExpiration(commentId: string, expiresAt: Date): Promise<void>;
  updatePriority(commentId: string, priority: number): Promise<void>;

  // удаление
  deleteComment(commentId: string): Promise<void>;
  deleteByPost(postId: string): Promise<void>;
  deleteByMessage(messageId: string): Promise<void>;
  deleteByComment(commentId: string): Promise<void>;

  // подсчёты
  countByPost(postId: string): Promise<number>;
  countByMessage(messageId: string): Promise<number>;
  countByComment(commentId: string): Promise<number>;
  countByUser(userId: string): Promise<number>;
  countReactions(commentId: string): Promise<number>;
  countByReactionType(commentId: string, type: string): Promise<number>;

  // реакции
  addReaction(commentId: string, userId: string, type: string): Promise<void>;
  removeReaction(commentId: string, userId: string): Promise<void>;

  // модерация
  flagComment(commentId: string, reason: string): Promise<void>;

  // аналитика
  getTopCommenters(limit: number): Promise<{ userId: string; count: number }[]>;
  getMostRepliedComments(limit: number): Promise<{ commentId: string; replies: number }[]>;
  getMostReactedComments(limit: number): Promise<{ commentId: string; reactions: number }[]>;

  // выборки по времени/приоритету
  findByDateRange(start: Date, end: Date): Promise<CommentDm[]>;
  findExpired(): Promise<CommentDm[]>;
  findByPriority(minPriority: number): Promise<CommentDm[]>;
}
