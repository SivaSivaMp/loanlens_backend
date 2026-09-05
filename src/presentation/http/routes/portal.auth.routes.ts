import { Router } from "express";
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

export default router;
