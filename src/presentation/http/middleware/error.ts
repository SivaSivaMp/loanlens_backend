import { logger } from "@/config/logger";
import { DomainError } from "@/domian/errors/DomainError";
import { Request, Response, NextFunction } from "express";
/**
 *
 * @param err
 * @param req
 * @param res
 * @param _next
 * @returns
 *
 * gloabal error handles
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  //know business rul violation
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
    return;
  }
  // Unknown/unexpected errors (bugs, infra failures)
  logger.error("Unhandled error: ", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again.",
    },
  });
}
