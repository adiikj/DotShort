import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { isUniqueViolation } from "../utils/dbErrors.js";

// Global error-handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Never swallow server-side errors silently: log them for debugging.
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);

  // Unique-constraint races (duplicate email/username/short code).
  if (isUniqueViolation(err)) {
    return res.status(409).json({
      success: false,
      message: "That value is already taken",
      errors: [],
    });
  }

  // Check if the error is an instance of ApiError
  if (err instanceof ApiError) {
    const { statusCode, message, errors, stack } = err;

    // Send JSON response with ApiError structure
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors || [],
      stack: process.env.NODE_ENV === "production" ? undefined : stack,
    });
  }

  // Fallback for generic errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
