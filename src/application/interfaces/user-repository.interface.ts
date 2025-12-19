import { UserDm } from '../../domain/entities/user.entity';
import { IBaseRepository } from './base-repository.interface';


export interface IUserRepository extends IBaseRepository<UserDm> {
  create(entity: UserDm): Promise<UserDm>;
  findByEmail(email: string): Promise<UserDm | null>;
  findByUsername(username: string): Promise<UserDm | null>;
}
