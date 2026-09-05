import { z } from "zod";

// ─── Register ─────────────────────────────────────────────────────────────────

export const RegisterUserSchema = z.object({
  body: z
    .object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      role: z.enum(["BANK_ADMIN", "COMPANY_DSA", "FIELD_AGENT"]),

      // Bank profile fields
      name: z.string().min(2).optional(),
      type: z.enum(["BANK", "NBFC", "HFC"]).optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      gstin: z.string().optional(),
      licenceNumber: z.string().optional(),
      websiteUrl: z.string().url().optional().or(z.literal("")),

      // Company DSA profile fields
      companyName: z.string().min(2).optional(),
      companyCode: z.string().min(2).optional(),

      // Field agent profile fields
      fullName: z.string().min(2).optional(),
      phone: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
      pan: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "BANK_ADMIN") {
        if (!data.name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["name"],
            message: "Bank name is required",
          });
        }
        if (!data.type) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["type"],
            message: "Bank type is required",
          });
        }
      }

      if (data.role === "COMPANY_DSA") {
        if (!data.companyName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["companyName"],
            message: "Company name is required",
          });
        }
        if (!data.companyCode) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["companyCode"],
            message: "Company code is required",
          });
        }
      }

      if (data.role === "FIELD_AGENT") {
        if (!data.companyCode) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["companyCode"],
            message: "Company code is required",
          });
        }
        if (!data.fullName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["fullName"],
            message: "Full name is required",
          });
        }
        if (!data.phone) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phone"],
            message: "Phone number is required",
          });
        }
      }
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
  query: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>["query"];

export const ResendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export type ResendVerificationDto = z.infer<
  typeof ResendVerificationSchema
>["body"];

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
