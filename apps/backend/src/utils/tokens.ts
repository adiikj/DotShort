import jwt from "jsonwebtoken";
import type { SessionUser } from "../types/session.js";

export const generateAccessToken = (user: SessionUser): string =>
  jwt.sign(
    {
      _id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
  );

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  } as jwt.SignOptions);

/** A uuid (pg's id format): rejects garbage before it reaches a query. */
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
