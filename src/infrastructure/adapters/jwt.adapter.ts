import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IJwtAdapter } from '../../application/interfaces/jwt-adapter.interface';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('TOKEN_KEY');
    if (!secret) {
      throw new Error('TOKEN_KEY is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-access-token'),
      ignoreExpiration: false,
      secretOrKey: secret, // теперь точно string
      audience: configService.get<string>('TOKEN_AUDIENCE'),
      issuer: configService.get<string>('TOKEN_ISSUER'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, isAdmin: payload.isAdmin };
  }
}



@Injectable()
export class JwtAdapter implements IJwtAdapter {
  constructor(private readonly configService: ConfigService) {}

  private getSecret(): string {
    const secret = this.configService.get<string>('TOKEN_KEY');
    if (!secret) throw new Error('JWT secret is not defined');
    return secret;
  }

  generateAccessToken(payload: Record<string, any>): string {
    const secret = this.getSecret();
    const expiresIn = Number(this.configService.get<string>('ACCESS_EXPIRES_IN')) || 900;

    return jwt.sign(payload, secret, {
      expiresIn, // число секунд
      audience: this.configService.get<string>('TOKEN_AUDIENCE'),
      issuer: this.configService.get<string>('TOKEN_ISSUER'),
    });
  }

  generateRefreshToken(payload: Record<string, any>): string {
    const secret = this.getSecret();
    const expiresIn = Number(this.configService.get<string>('REFRESH_EXPIRES_IN')) || 604800;

    return jwt.sign(payload, secret, {
      expiresIn,
      audience: this.configService.get<string>('TOKEN_AUDIENCE'),
      issuer: this.configService.get<string>('TOKEN_ISSUER'),
    });
  }

  verifyToken(token: string): any {
    const secret = this.getSecret();
    return jwt.verify(token, secret);
  }
}
