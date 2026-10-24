import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db, users } from "../db/index.js";
import { parseOrThrow } from "../utils/validate.js";
import { registerSchema, loginSchema, refreshSchema, updateProfileSchema, changePasswordSchema } from "../validations/user.validation.js";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookies.js";
import { generateAccessToken, generateRefreshToken, isUuid } from "../utils/tokens.js";
import { isUniqueViolation } from "../utils/dbErrors.js";
import type { SessionUser } from "../types/session.js";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

// Generate a fresh access/refresh token pair and persist the refresh token.
const generateAccessAndRefreshTokens = async (userId: string) => {
  const [user] = await db
    .select({ id: users.id, name: users.name, username: users.username, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  await db.update(users).set({ refreshToken, updatedAt: new Date() }).where(eq(users.id, userId));

  return { accessToken, refreshToken };
};

// User Login
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrUsername, password } = parseOrThrow(loginSchema, req.body);

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, emailOrUsername), eq(users.username, emailOrUsername)))
    .limit(1);

  // Same message for "no such user" and "wrong password": don't leak which
  // emails/usernames are registered.
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
  };

  res
    .status(200)
    .cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions())
    .cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions())
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: sessionUser,
        accessToken,
        refreshToken,
      })
    );
});

// Exchange a valid refresh token for a new token pair (rotates the stored
// refresh token; a stale/reused refresh token invalidates the session).
const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  const body = parseOrThrow(refreshSchema, req.body ?? {});
  const token =
    (typeof req.cookies?.[REFRESH_TOKEN_COOKIE] === "string"
      ? req.cookies[REFRESH_TOKEN_COOKIE]
      : undefined) ?? body.refreshToken;

  if (!token) {
    throw new ApiError(401, "Unauthorized: refresh token is missing");
  }

  let decodedToken: { _id?: string };
  try {
    decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as {
      _id?: string;
    };
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (!isUuid(decodedToken?._id)) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const [user] = await db.select().from(users).where(eq(users.id, decodedToken._id)).limit(1);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Reuse detection: anything other than the currently-stored token is stale
  // (already rotated, or stolen and used after rotation): kill the session.
  if (!user.refreshToken || user.refreshToken !== token) {
    await db
      .update(users)
      .set({ refreshToken: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    throw new ApiError(401, "Refresh token has been revoked. Please sign in again.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

  res
    .status(200)
    .cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions())
    .cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions())
    .json(
      new ApiResponse(200, "Token refreshed successfully", {
        accessToken,
        refreshToken,
      })
    );
});

// User Logout
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  await db
    .update(users)
    .set({ refreshToken: null, updatedAt: new Date() })
    .where(eq(users.id, req.user.id));

  // Clear with the exact attributes used when setting, or the cookie survives.
  return res
    .status(200)
    .clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions())
    .clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions())
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, email, password } = parseOrThrow(registerSchema, req.body);

  // Check if user already exists (by email or username) for a friendly message.
  const [existingUser] = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);

  if (existingUser) {
    const errorField = existingUser.email === email ? "Email" : "Username";
    throw new ApiError(409, `${errorField} is already registered.`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let newUser: { id: string; name: string; username: string; email: string };
  try {
    [newUser] = await db
      .insert(users)
      .values({ name, username, email, passwordHash })
      .returning({ id: users.id, name: users.name, username: users.username, email: users.email });
  } catch (error) {
    // Unique constraint raced past the friendly check above.
    if (isUniqueViolation(error)) {
      throw new ApiError(409, "Email or username is already registered.");
    }
    throw error;
  }

  res.status(201).json(
    new ApiResponse(201, "User registered successfully. Please sign in.", {
      user: newUser,
    })
  );
});

const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const [user] = await db
    .select({
      name: users.name,
      username: users.username,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, req.user.id))
    .limit(1);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Profile fetched successfully", {
      name: user.name,
      username: user.username,
      email: user.email,
      memberSince: user.createdAt,
    })
  );
});

// Update name and/or username (username must stay unique).
const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const updates = parseOrThrow(updateProfileSchema, req.body);
  if (updates.name === undefined && updates.username === undefined) {
    throw new ApiError(400, "Nothing to update");
  }

  if (updates.username !== undefined && updates.username !== req.user.username) {
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, updates.username))
      .limit(1);
    if (taken) {
      throw new ApiError(409, "Username is already taken.");
    }
  }

  try {
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, req.user.id))
      .returning({
        name: users.name,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
      });

    res.status(200).json(
      new ApiResponse(200, "Profile updated successfully", {
        name: updated.name,
        username: updated.username,
        email: updated.email,
        memberSince: updated.createdAt,
      })
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError(409, "Username is already taken.");
    }
    throw error;
  }
});

// Change the account password; rotates the refresh token so other sessions
// are signed out while the current one receives a fresh pair.
const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const { currentPassword, newPassword } = parseOrThrow(changePasswordSchema, req.body);

  const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const refreshToken = generateRefreshToken(user.id);

  await db
    .update(users)
    .set({ passwordHash, refreshToken, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  const accessToken = generateAccessToken({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
  });

  res
    .status(200)
    .cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions())
    .cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions())
    .json(
      new ApiResponse(200, "Password changed successfully", {
        accessToken,
        refreshToken,
      })
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
  getProfile,
  updateProfile,
  changePassword,
};
