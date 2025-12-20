import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginSchema, LogoutSchema, RefreshSchema, RegisterSchema } from '../schemas/auth.schemas';
import { UserDm } from '../../domain/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterSchema): Promise<UserDm> {
    return this.authService.register(dto.username, dto.email, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginSchema): Promise<{ accessToken: string; refreshToken: string; }> {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('logout')
  async logout(@Body() dto: LogoutSchema): Promise<{ success: boolean; }> {
    return this.authService.logout(dto.userId);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshSchema): Promise<{ accessToken: string; }> {
    return this.authService.refresh(dto.refreshToken);
  }
}
