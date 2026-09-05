import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  ForgotPasswordSchema,
  LoginUserSchema,
  RefreshTokenSchema,
  RegisterUserSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
} from "@/application/dtos/auth/auth.dto";
import { authController } from "@/container";
import { authRateLimit } from "../middleware/rateLimit";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/register", validate(RegisterUserSchema), authController.register);

router.post(
  "/login",
  authRateLimit,
  validate(LoginUserSchema),
  authController.login,
);

router.post("/refresh", validate(RefreshTokenSchema), authController.refresh);

router.post("/logout", authenticate, authController.logout);

// Verify email via link: GET /api/v1/auth/verify-email?token=<token>
router.get("/verify-email", validate(VerifyEmailSchema), authController.verifyEmail);

// Resend B2B verification email: POST /api/v1/auth/resend-verification
router.post(
  "/resend-verification",
  authRateLimit,
  validate(ResendVerificationSchema),
  authController.resendVerification,
);

router.post(
  "/forgot-password",
  authRateLimit,
  validate(ForgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(ResetPasswordSchema),
  authController.resetPassword,
);

router.get("/me", authenticate, authController.me);
export default router;
