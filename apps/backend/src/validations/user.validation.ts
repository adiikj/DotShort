import { z } from "zod";

export const registerSchema = z.strictObject({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers and underscores"),
  email: z.email("Enter a valid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.strictObject({
  emailOrUsername: z.string().trim().min(1, "Email or username is required").max(254),
  password: z.string().min(1, "Password is required").max(128),
});

export const refreshSchema = z.strictObject({
  refreshToken: z.string().min(1).optional(),
});

export const updateProfileSchema = z
  .strictObject({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(50).optional(),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers and underscores")
      .optional(),
  })
  .refine((value) => value.name !== undefined || value.username !== undefined, {
    message: "Nothing to update",
  });

export const changePasswordSchema = z.strictObject({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
