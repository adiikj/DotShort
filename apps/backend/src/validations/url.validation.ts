import { z } from "zod";

const httpUrl = z
  .url("Enter a valid URL")
  .max(2048, "URL must be at most 2048 characters")
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }, "URL must start with http:// or https://");

export const shortCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_-]{3,20}$/, "Short code must be 3-20 characters: letters, numbers, - or _");

export const shortCodeParamSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{1,64}$/, "Invalid short code");

export const shortenSchema = z.strictObject({
  longUrl: httpUrl,
  shortCode: shortCodeSchema.optional(),
  password: z.string().min(1).max(128).optional(),
  expireInHours: z.coerce
    .number({ message: "Expiration must be a number of hours" })
    .int("Expiration must be a whole number of hours")
    .min(1, "Expiration must be at least 1 hour")
    .max(8760, "Expiration must be at most 365 days")
    .optional(),
});

export const validatePasswordSchema = z.strictObject({
  shortCode: z.string().trim().regex(/^[a-zA-Z0-9_-]{1,64}$/, "Invalid short code"),
  password: z.string().min(1, "Password is required").max(128),
});

// PATCH /links/:shortCode: null clears the field.
export const updateLinkSchema = z
  .strictObject({
    longUrl: httpUrl.optional(),
    password: z.string().min(1).max(128).nullable().optional(),
    expireInHours: z.coerce
      .number({ message: "Expiration must be a number of hours" })
      .int("Expiration must be a whole number of hours")
      .min(1, "Expiration must be at least 1 hour")
      .max(8760, "Expiration must be at most 365 days")
      .nullable()
      .optional(),
  })
  .refine(
    (value) =>
      value.longUrl !== undefined || value.password !== undefined || value.expireInHours !== undefined,
    { message: "Nothing to update" }
  );
