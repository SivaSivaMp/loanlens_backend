import { z } from "zod";

// ─── Register ─────────────────────────────────────────────────────────────────

export const RegisterUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["BANK_ADMIN", "COMPANY_DSA", "FIELD_AGENT"]),
    // Role-specific fields (validated further in use case)
    companyCode: z.string().optional(), // required for FIELD_AGENT
  }),
});
export type RegisterUserDto = z.infer<typeof RegisterUserSchema>["body"];

// ─── Login ────────────────────────────────────────────────────────────────────

export const LoginUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
export type LoginUserDto = z.infer<typeof LoginUserSchema>["body"];

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>["body"];

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>["body"];

// ─── Reset Password ───────────────────────────────────────────────────────────

export const ResetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>["body"];

// ─── Verify Email ─────────────────────────────────────────────────────────────

export const VerifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

// ─── Portal Register ──────────────────────────────────────────────────────────

export const RegisterPortalUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});
export type RegisterPortalUserDto = z.infer<
  typeof RegisterPortalUserSchema
>["body"];
