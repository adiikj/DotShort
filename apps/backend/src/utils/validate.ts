import { z } from "zod";
import { ApiError } from "./ApiError.js";

/** Parse input or throw a 400 ApiError listing every failed field. */
export function parseOrThrow<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) =>
      issue.path.length > 0 ? `${issue.path.join(".")}: ${issue.message}` : issue.message
    );
    throw new ApiError(400, "Invalid request data", errors);
  }
  return result.data;
}
