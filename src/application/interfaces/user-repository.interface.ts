// application/interfaces/user-repository.interface.ts
import { IBaseRepository } from './base-repository.interface';
import { UserDm } from '../../domain/entities/user.entity';

export interface IUserRepository extends IBaseRepository<UserDm> {
  create(entity: UserDm): Promise<UserDm>;
  findByEmail(email: string): Promise<UserDm | null>;
  findByUsername(username: string): Promise<UserDm | null>;
  findByPhone(phone: string): Promise<UserDm | null>;
  findByStatus(status: string): Promise<UserDm[]>;
  findActive(limit?: number): Promise<UserDm[]>;
  findAdmins(): Promise<UserDm[]>;
  findVerified(): Promise<UserDm[]>;
  findByRole(role: string): Promise<UserDm[]>;
  searchByName(keyword: string, limit?: number): Promise<UserDm[]>;
  searchByBiography(keyword: string, limit?: number): Promise<UserDm[]>;
  getRecentlyActive(limit?: number): Promise<UserDm[]>;
  getRecentLogins(limit?: number): Promise<UserDm[]>;
  updateLastSeen(userId: string): Promise<void>;
  deactivate(userId: string): Promise<void>;
  countByStatus(status: string): Promise<number>;
  addFriend(userId: string, friendId: string): Promise<void>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  followUser(userId: string, targetId: string): Promise<void>;
  unfollowUser(userId: string, targetId: string): Promise<void>;
}
