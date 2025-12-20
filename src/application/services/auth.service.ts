import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDm } from '../../domain/entities/user.entity';
import type { IJwtAdapter } from '../interfaces/jwt-adapter.interface';
import type { IUserRepository } from '../interfaces/user-repository.interface';
import type { IPasswordAdapter } from '../interfaces/password-adapter.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IJwtAdapter') private readonly jwtAdapter: IJwtAdapter,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPasswordAdapter') private readonly passwordAdapter: IPasswordAdapter,
  ) {}



  async register(username: string, email: string, password: string): Promise<UserDm> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new UnauthorizedException('Email already registered');
    const passwordHash = await this.passwordAdapter.hash(password);
    const user = new UserDm({
      username,
      email,
      passwordHash,
      isActive: true,
      status: 'active',
      isAdmin: false,
      verified: false,
      roles: ['user'],
    });

    return this.userRepository.create(user);
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new UnauthorizedException('User not found');

    const match = await this.passwordAdapter.verify(user.passwordHash, password);
    if (!match) {
      // бизнес‑сценарий: фиксируем неудачную попытку
      await this.userRepository.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, isAdmin: user.isAdmin };
    const accessToken = this.jwtAdapter.generateAccessToken(payload);
    const refreshToken = this.jwtAdapter.generateRefreshToken(payload);

    // бизнес‑сценарий: успешный вход
    await this.userRepository.resetFailedLoginAttempts(user.id);
    await this.userRepository.updateLastLogin(user.id);

    return { accessToken, refreshToken };
  }

  async verify(token: string) {
    try {
      return this.jwtAdapter.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(userId: string) {
    await this.userRepository.deactivate(userId);
    return { success: true };
  }

  async refresh(refreshToken: string) {
    const payload = this.jwtAdapter.verifyToken(refreshToken);
    const newAccessToken = this.jwtAdapter.generateAccessToken({
      userId: payload.userId,
      isAdmin: payload.isAdmin,
    });
    return { accessToken: newAccessToken };
  }
}
