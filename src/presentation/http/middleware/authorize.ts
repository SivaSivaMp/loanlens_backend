import { UserRole } from "@/domian/entities/User";
import { ForbiddenError } from "@/domian/errors/errors";
import { Request, Response, NextFunction } from "express";

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res
        .status(401)
        .json({
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required",
          },
        });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new ForbiddenError(
        `This action requires ${allowedRoles.join(" or ")} role`,
      );
      res
        .status(error.statusCode)
        .json({
          success: false,
          error: { code: error.errorCode, message: error.message },
        });
      return;
    }

    next();
  };
}
