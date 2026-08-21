import { DomainError } from "@/domian/errors/DomainError";
import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape, ZodError } from "zod";

/**
 * validate — Zod validation middleware factory.
 * Validates req.body, req.query, and req.params against a Zod schema.
 * Throws a VALIDATION_ERROR DomainError with all field errors if validation fails.
 *
 * Usage: router.post('/register', validate(RegisterUserSchema), controller.register)
 */
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
