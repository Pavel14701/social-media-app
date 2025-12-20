export interface IJwtAdapter {
  generateAccessToken(payload: Record<string, any>): string;
  generateRefreshToken(payload: Record<string, any>): string;
  verifyToken(token: string): any;
}
