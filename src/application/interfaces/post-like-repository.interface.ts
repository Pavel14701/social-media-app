import { PostLikeDm } from "../../domain/entities/post-like.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IPostLikeRepository extends IBaseRepository<PostLikeDm> {
  create(entity: PostLikeDm): Promise<PostLikeDm>;
  findByUser(userId: string): Promise<PostLikeDm[]>;
  findByPost(postId: string): Promise<PostLikeDm[]>;
  exists(postId: string, userId: string): Promise<boolean>;
  deleteByUserAndPost(postId: string, userId: string): Promise<void>;
  countByPost(postId: string): Promise<number>;
  findPreview(postIds: string[]): Promise<Map<string, string[]>>;
}
