import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  LoginUserSchema,
  RegisterUserSchema,
} from "@/application/dtos/auth/auth.dto";
import { authController } from "@/container";
import { authRateLimit } from "../middleware/rateLimit";

const router = Router();

router.post("/register", validate(RegisterUserSchema), authController.register);

router.post(
  "/login",
  authRateLimit,
  validate(LoginUserSchema),
  authController.login,
);
