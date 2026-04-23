import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional().nullable(),
  role: z.enum(["User", "admin"]).optional(),
  is_active: z.boolean().optional(),
});

export const userIdSchema = z.object({
  UserId: z.string().uuid("Invalid User ID format"),
});

export const userCredentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UpdateuserInput = z.infer<typeof updateUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UserLoginInput = z.infer<typeof userCredentialsSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
