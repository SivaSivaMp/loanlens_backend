import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  ForgotPasswordSchema,
  LoginUserSchema,
  RefreshTokenSchema,
  RegisterUserSchema,
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
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/forgot-password",
  authRateLimit,
  validate(ForgotPasswordSchema),
  authController.forgotPassword,
);
router.post("/reset-password");
export default router;
