import {
  ITokenService,
  PortalTokenPayload,
  TokenPayload,
} from "@/application/interfaces/ITokenService";
import { env } from "@/config/env";
import { InvalidTokenError } from "@/domian/errors/errors";
import jwt from "jsonwebtoken";

export class JwtTokenService implements ITokenService {
  //B2B toker
  signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_PORTAL_ACCESS_EXPIRES as any,
    });
  }
  signRefreshToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES as any,
    });
  }
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw new InvalidTokenError("Invalid or expired access token");
    }
  }
  verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      throw new InvalidTokenError("Invalid refresh token");
    }
  }

  //portal tokens

  signPortalAccessToken(payload: PortalTokenPayload): string {
    return jwt.sign(payload, env.JWT_PORTAL_ACCESS_SECRET, {
      expiresIn: env.JWT_PORTAL_ACCESS_EXPIRES as any,
    });
  }

  signPortalRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: "portal" }, env.JWT_PORTAL_REFRESH_SECRET, {
      expiresIn: env.JWT_PORTAL_REFRESH_EXPIRES as any,
    });
  }
  verifyPortalAccessToken(token: string): PortalTokenPayload {
    try {
      return jwt.verify(
        token,
        env.JWT_PORTAL_ACCESS_SECRET,
      ) as PortalTokenPayload;
    } catch {
      throw new InvalidTokenError("Invalid or expired portal access token");
    }
  }
  verifyPortalRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, env.JWT_PORTAL_REFRESH_SECRET) as {
        userId: string;
      };
    } catch {
      throw new InvalidTokenError("Invalid portal refresh token");
    }
  }
}
