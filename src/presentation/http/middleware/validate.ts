import { DomainError } from "@/domian/errors/DomainError";
import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape, ZodError } from "zod";

export function validate(schema: ZodObject<ZodRawShape>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((e) => ({
        field: e.path.slice(1).join("."), // remove 'body'/'query'/'params' prefix
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors,
        },
      });
      return;
    }

    next();
  };
}
