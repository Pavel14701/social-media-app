import { FollowDm } from "../../domain/entities/follow.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IFollowRepository extends IBaseRepository<FollowDm> {
  create(entity: FollowDm): Promise<FollowDm>;

  // выборка подписчиков
  findFollowers(userId: string): Promise<FollowDm[]>;

  // выборка подписок
  findFollowing(userId: string): Promise<FollowDm[]>;

  // проверка существования подписки
  exists(userId: string, followingId: string): Promise<boolean>;

  // удалить одну подписку
  deleteFollow(userId: string, followingId: string): Promise<void>;

  // удалить все подписки пользователя
  deleteByUser(userId: string): Promise<void>;

  // удалить всех подписчиков пользователя
  deleteByFollowing(followingId: string): Promise<void>;

  // количество подписчиков
  countFollowers(userId: string): Promise<number>;

  // количество подписок
  countFollowing(userId: string): Promise<number>;

  // выборка взаимных подписок
  findMutual(userId: string): Promise<FollowDm[]>;

  // выборка по статусу
  findByStatus(userId: string, status: string): Promise<FollowDm[]>;

  // топ пользователей по подписчикам
  getTopFollowed(limit: number): Promise<{ userId: string; count: number }[]>;

  // топ пользователей по подпискам
  getTopFollowing(limit: number): Promise<{ userId: string; count: number }[]>;

  // выборка подписок за период
  findByDateRange(start: Date, end: Date): Promise<FollowDm[]>;
}
