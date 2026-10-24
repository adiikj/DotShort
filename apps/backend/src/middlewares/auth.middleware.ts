import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { db, users } from "../db/index.js";
import { isUuid } from "../utils/tokens.js";
import type { SessionUser } from "../types/session.js";
import type { Request } from "express";

/** Read the access token from the httpOnly cookie or an Authorization header. */
const extractToken = (req: Request): string | null => {
  const cookieToken = req.cookies?.accessToken;
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
};

/**
 * Verify an access token and load its user.
 * Only token problems become 401s: database errors propagate to the
 * global error handler instead of being masked as auth failures.
 */
const resolveUserFromToken = async (token: string): Promise<SessionUser> => {
  let decodedToken: { _id?: string };

  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as {
      _id?: string;
    };
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  if (!isUuid(decodedToken?._id)) {
    throw new ApiError(401, "Invalid access token");
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, username: users.username, email: users.email })
    .from(users)
    .where(eq(users.id, decodedToken._id))
    .limit(1);

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  return user;
};

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new ApiError(401, "Unauthorized: access token is missing");
  }

  req.user = await resolveUserFromToken(token);
  next();
});

export const optionalVerifyJWT = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = await resolveUserFromToken(token);
  } catch {
    // An invalid token on an optional route means "anonymous", not "forbidden".
    req.user = null;
  }
  next();
});
