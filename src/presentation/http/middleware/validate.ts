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

    // Mutate existing objects in-place — req.query and req.params are read-only
    // getters on IncomingMessage so they cannot be reassigned directly.
    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.query !== undefined)
      Object.assign(req.query, result.data.query);
    if (result.data.params !== undefined)
      Object.assign(req.params, result.data.params);

    next();
  };
}
