import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repo';
import { UserDm } from '../../domain/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async create(user: UserDm): Promise<UserDm> {
    return this.userRepo.save(user);
  }

  async findByUsername(username: string): Promise<UserDm | null> {
    return this.userRepo.findByUsername(username);
  }
}
