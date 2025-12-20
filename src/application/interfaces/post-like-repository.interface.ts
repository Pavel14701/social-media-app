import { PostLikeDm } from "../../domain/entities/post-like.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IPostLikeRepository extends IBaseRepository<PostLikeDm> {
  create(entity: PostLikeDm): Promise<PostLikeDm>;

  // выборка лайков по пользователю
  findByUser(userId: string): Promise<PostLikeDm[]>;

  // выборка лайков по посту
  findByPost(postId: string): Promise<PostLikeDm[]>;

  // проверка существования лайка
  exists(postId: string, userId: string): Promise<boolean>;

  // удалить лайк по пользователю и посту
  deleteByUserAndPost(postId: string, userId: string): Promise<void>;

  // удалить все лайки поста
  deleteByPost(postId: string): Promise<void>;

  // удалить все лайки пользователя
  deleteByUser(userId: string): Promise<void>;

  // количество лайков поста
  countByPost(postId: string): Promise<number>;

  // количество лайков пользователя
  countByUser(userId: string): Promise<number>;

  // превью лайков (первые пользователи)
  findPreview(postIds: string[]): Promise<Map<string, string[]>>;

  // топ пользователей по лайкам
  getTopLikers(limit: number): Promise<{ userId: string; count: number }[]>;

  // топ постов по лайкам
  getTopLikedPosts(limit: number): Promise<{ postId: string; count: number }[]>;

  // выборка лайков за период
  findByDateRange(start: Date, end: Date): Promise<PostLikeDm[]>;
}
