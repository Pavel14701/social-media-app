import { CommentDm } from "../../domain/entities/comment.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface ICommentRepository extends IBaseRepository<CommentDm> {
  create(entity: CommentDm): Promise<CommentDm>;

  findByPost(postId: string): Promise<CommentDm[]>;
  findByUser(userId: string): Promise<CommentDm[]>;
  findReplies(parentId: string): Promise<CommentDm[]>;

  updateContent(commentId: string, newContent: string): Promise<CommentDm | null>;

  deleteComment(commentId: string): Promise<void>;
  deleteByPost(postId: string): Promise<void>;

  countByPost(postId: string): Promise<number>;
  countByUser(userId: string): Promise<number>;

  addReaction(commentId: string, userId: string, type: string): Promise<void>;
  removeReaction(commentId: string, userId: string): Promise<void>;
  countReactions(commentId: string): Promise<number>;
  countByReactionType(commentId: string, type: string): Promise<number>;

  flagComment(commentId: string, reason: string): Promise<void>;

  getTopCommenters(limit: number): Promise<{ userId: string; count: number }[]>;
  getMostRepliedComments(limit: number): Promise<{ commentId: string; replies: number }[]>;
  getMostReactedComments(limit: number): Promise<{ commentId: string; reactions: number }[]>;

  findByDateRange(start: Date, end: Date): Promise<CommentDm[]>;
}
