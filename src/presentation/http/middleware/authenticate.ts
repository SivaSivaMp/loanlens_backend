import { UserRole } from "@/domian/entities/User";
import { DomainError } from "@/domian/errors/DomainError";
import { JwtTokenService } from "@/infrastructure/services/JwtTokenService";
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
 *
 * @param req
 * @param res
 * @param next
 * @returns void
 * authenticate B2B
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

  try {
    const token = authHeader.slice(7);
    const payload = tokenService.verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
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
  }
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns void
 * authenticate portal
 */

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

  try {
    const token = authHeader.slice(7);
    const payload = tokenService.verifyPortalAccessToken(token);
    req.portalUser = { userId: payload.userId, type: "portal" };
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid portal token" },
    });
  }
}
