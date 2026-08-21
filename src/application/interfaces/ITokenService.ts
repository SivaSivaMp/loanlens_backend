import { UserRole } from "@/domian/entities/User";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export interface PortalTokenPayload {
  userId: string;
  type: "portal";
}

export interface ITokenService {
  // B2B
  signAccessToken(payload: TokenPayload): string;
  signRefreshToken(userId: string): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): { userId: string };

  // Portal
  signPortalAccessToken(payload: PortalTokenPayload): string;
  signPortalRefreshToken(userId: string): string;
  verifyPortalAccessToken(token: string): PortalTokenPayload;
  verifyPortalRefreshToken(token: string): { userId: string };
}
