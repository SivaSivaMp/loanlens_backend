import { UserRole } from "@/domain/entities/User";
import { DomainError } from "@/domain/errors/DomainError";
import { JwtTokenService } from "@/infrastructure/services/JwtTokenService";
import { isPortalUserBlocked } from "@/infrastructure/cache/portalBlocklist";
import { isAgentBlocked } from "@/infrastructure/cache/agentBlocklist";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
      portalUser?: {
        userId: string;
        type: "portal";
      };
    }
  }
}

const tokenService = new JwtTokenService();

/**
 * Authenticate B2B (COMPANY_DSA / FIELD_AGENT / BANK_ADMIN).
 *
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "MISSING_TOKEN", message: "Authentication required" },
    });
    return;
  }

  let userId: string;
  let role: UserRole;
  try {
    const token = authHeader.slice(7);
    const payload = tokenService.verifyAccessToken(token);
    userId = payload.userId;
    role = payload.role;
  } catch (err) {
    if (err instanceof DomainError) {
      res.status(err.statusCode).json({
        success: false,
        error: { code: err.errorCode, message: err.message },
      });
    } else {
      res.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Invalid token" },
      });
    }
    return;
  }

  isAgentBlocked(userId)
    .then((blocked) => {
      if (blocked) {
        res.status(403).json({
          success: false,
          error: {
            code: "ACCOUNT_DISABLED",
            message:
              "Your account has been deactivated. Please contact your manager.",
          },
        });
        return;
      }
      req.user = { userId, role };
      next();
    })
    .catch(() => {
      req.user = { userId, role };
      next();
    });
}

export function authenticatePortal(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "MISSING_TOKEN", message: "Authentication required" },
    });
    return;
  }

  let userId: string;
  try {
    const token = authHeader.slice(7);
    const payload = tokenService.verifyPortalAccessToken(token);
    userId = payload.userId;
  } catch {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid portal token" },
    });
    return;
  }

  // the access token to expire naturally.
  isPortalUserBlocked(userId)
    .then((blocked) => {
      if (blocked) {
        res.status(403).json({
          success: false,
          error: {
            code: "ACCOUNT_DISABLED",
            message:
              "Your account has been deactivated. Please contact support.",
          },
        });
        return;
      }
      req.portalUser = { userId, type: "portal" };
      next();
    })
    .catch(() => {
      // If Redis is down, fail open — don't block legitimate users.
      req.portalUser = { userId, type: "portal" };
      next();
    });
}
