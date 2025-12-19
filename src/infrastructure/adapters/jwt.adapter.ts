// src/auth/jwt.adapter.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.TOKEN_KEY;
    if (!secret) {
      throw new Error('TOKEN_KEY is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-access-token'),
      ignoreExpiration: false,
      secretOrKey: secret, // теперь точно string
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, isAdmin: payload.isAdmin };
  }
}