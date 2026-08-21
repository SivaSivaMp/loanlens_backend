import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  // App
  PORT: z.string().default("5000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Redis
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // JWT B2B
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  // JWT Portal
  JWT_PORTAL_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_PORTAL_ACCESS_SECRET must be at least 32 chars"),
  JWT_PORTAL_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_PORTAL_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_PORTAL_REFRESH_SECRET must be at least 32 chars"),
  JWT_PORTAL_REFRESH_EXPIRES: z.string().default("7d"),

  // Email
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  EMAIL_FROM: z.string().default("LoanLens <noreply@loanlens.in>"),

  // Optional — needed in later weeks
  OPENAI_API_KEY: z.string().optional(),
  AGORA_APP_ID: z.string().optional(),
  AGORA_APP_CERTIFICATE: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const _parsed = EnvSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error("❌ Invalid environment variables:");
  _parsed.error.issues.forEach((e) => {
    console.error(`  ${e.path.join(".")}: ${e.message}`);
  });
  process.exit(1);
}

export const env = _parsed.data;
