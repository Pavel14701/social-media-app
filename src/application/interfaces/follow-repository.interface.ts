import { FollowDm } from "../../domain/entities/follow.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IFollowRepository extends IBaseRepository<FollowDm> {
  create(entity: FollowDm): Promise<FollowDm>;
  findFollowers(userId: string): Promise<FollowDm[]>;
  findFollowing(userId: string): Promise<FollowDm[]>;
  exists(userId: string, followingId: string): Promise<boolean>;
  deleteFollow(userId: string, followingId: string): Promise<void>;
  countFollowers(userId: string): Promise<number>;
  countFollowing(userId: string): Promise<number>;
}
