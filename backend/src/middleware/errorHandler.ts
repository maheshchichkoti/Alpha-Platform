import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { log } from "../lib/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.error({ err, path: req.path }, "An error occurred");

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }

  // Add more specific error types here if needed

  res.status(500).json({
    message: err.message || "An unexpected internal server error occurred.",
  });
}
