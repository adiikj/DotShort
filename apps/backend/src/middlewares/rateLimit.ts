import { rateLimit } from "express-rate-limit";
import type { Request, Response } from "express";

const tooManyRequests = (req: Request, res: Response /*, next: NextFunction */) => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please wait a moment and try again.",
  });
};

const baseOptions = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  handler: tooManyRequests,
};

/** Generous global ceiling to keep the API from being hammered. */
export const globalLimiter = rateLimit({
  ...baseOptions,
  limit: 300,
});

/** Strict limit for login (brute-force protection). */
export const loginLimiter = rateLimit({
  ...baseOptions,
  limit: 10,
});

/** Separate budget so signup bursts never starve logins (or vice versa). */
export const registerLimiter = rateLimit({
  ...baseOptions,
  limit: 10,
});

/** Refresh happens on every token expiry: more generous, still bounded. */
export const refreshLimiter = rateLimit({
  ...baseOptions,
  limit: 30,
});

/** Limit for link creation. */
export const shortenLimiter = rateLimit({
  ...baseOptions,
  limit: 60,
});

/** Strict limit for guessing passwords on protected links. */
export const passwordGuessLimiter = rateLimit({
  ...baseOptions,
  limit: 10,
});
