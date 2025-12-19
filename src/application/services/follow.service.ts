import { Injectable } from '@nestjs/common';
import { FollowRepository } from '../../infrastructure/repositories/follow.repository';
import { Follow } from '../../follows/schemas/follow.schema';

@Injectable()
export class FollowService {
  constructor(private readonly followRepo: FollowRepository) {}

  async follow(userId: string, followingId: string): Promise<Follow> {
    const existing = await this.followRepo.find(userId, followingId);
    if (existing) throw new Error('Already following this user');
    return this.followRepo.create(userId, followingId);
  }

  async unfollow(userId: string, followingId: string): Promise<Follow | null> {
    const existing = await this.followRepo.find(userId, followingId);
    if (!existing) throw new Error('Not already following user');
    return this.followRepo.delete(existing.id);
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    return this.followRepo.findFollowers(userId);
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    return this.followRepo.findFollowing(userId);
  }
}
