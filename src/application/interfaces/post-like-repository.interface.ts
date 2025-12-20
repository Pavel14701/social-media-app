import { PostLikeDm } from "../../domain/entities/post-like.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IPostLikeRepository extends IBaseRepository<PostLikeDm> {
  create(entity: PostLikeDm): Promise<PostLikeDm>;

  findByUser(userId: string): Promise<PostLikeDm[]>;
  findByPost(postId: string): Promise<PostLikeDm[]>;
  findByComment(commentId: string): Promise<PostLikeDm[]>;

  exists(postId: string, userId: string): Promise<boolean>;
  existsComment(commentId: string, userId: string): Promise<boolean>;

  deleteByUserAndPost(postId: string, userId: string): Promise<void>;
  deleteByUserAndComment(commentId: string, userId: string): Promise<void>;
  deleteByPost(postId: string): Promise<void>;
  deleteByComment(commentId: string): Promise<void>;
  deleteByUser(userId: string): Promise<void>;

  countByPost(postId: string): Promise<number>;
  countByComment(commentId: string): Promise<number>;
  countByUser(userId: string): Promise<number>;

  getTopLikers(limit: number): Promise<{ userId: string; count: number }[]>;
  getTopLikedPosts(limit: number): Promise<{ postId: string; count: number }[]>;
  getTopLikedComments(limit: number): Promise<{ commentId: string; count: number }[]>;

  findByDateRange(start: Date, end: Date): Promise<PostLikeDm[]>;
  findPreview(postIds: string[]): Promise<Map<string, string[]>>;

  flagReaction(id: string, reason: string): Promise<void>;
}
