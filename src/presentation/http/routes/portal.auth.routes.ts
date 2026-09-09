import { Router } from "express";
import passport from "passport";
import { validate } from "../middleware/validate";
import {
  LoginUserSchema,
  ResendVerificationSchema,
  RegisterPortalUserSchema,
  VerifyEmailSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/application/dtos/auth/auth.dto";
import { authRateLimit } from "../middleware/rateLimit";
import { authenticatePortal } from "../middleware/authenticate";
import { portalAuthController } from "@/container";
import { env } from "@/config/env";

const router = Router();

// POST /api/v1/portal/auth/register
router.post(
  "/register",
  validate(RegisterPortalUserSchema),
  portalAuthController.register,
);

// POST /api/v1/portal/auth/login
router.post(
  "/login",
  authRateLimit,
  validate(LoginUserSchema),
  portalAuthController.login,
);

// GET /api/v1/portal/auth/verify-email?token=<token>
router.get(
  "/verify-email",
  validate(VerifyEmailSchema),
  portalAuthController.verifyEmail,
);

// POST /api/v1/portal/auth/resend-verification
router.post(
  "/resend-verification",
  authRateLimit,
  validate(ResendVerificationSchema),
  portalAuthController.resendVerification,
);

// GET /api/v1/portal/auth/me
router.get("/me", authenticatePortal, portalAuthController.me);

router.post(
  "/forgot-password",
  authRateLimit,
  validate(ForgotPasswordSchema),
  portalAuthController.forgotPassword,
);

router.post(
  "/reset-password",
  validate(ResetPasswordSchema),
  portalAuthController.resetPassword,
);

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// GET /api/v1/portal/auth/google  — initiate OAuth consent screen
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// GET /api/v1/portal/auth/google/callback  — Google redirects here after approval
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/portal/login?error=oauth_failed`,
  }),
  portalAuthController.googleCallback,
);

export default router;
