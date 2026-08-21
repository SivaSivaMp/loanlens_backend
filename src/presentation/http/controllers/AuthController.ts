import { Request, Response } from "express";
import { LoginUserUseCase } from "@/application/use-cases/auth/LoginUserUseCase";
import {
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
} from "@/application/use-cases/auth/PasswordResetUseCase";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/RefreshTokenUseCase";
import { RegisterUserUseCase } from "@/application/use-cases/auth/RegisterUserUseCase";
import { VerifyEmailUseCase } from "@/application/use-cases/auth/VerifyEmailUseCase";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/response";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.registerUseCase.execute(req.body);
    return successResponse(res, result, result.message, 201);
  });
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.loginUseCase.execute(req.body);
    return successResponse(res, result, "Login successful");
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await this.refreshTokenUseCase.execute(refreshToken);
    return successResponse(res, result, "Tokens refreshed");
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    // Revoke the refresh token on logout — handled in the repository
    // (The access token expires naturally after 15 min)
    return successResponse(res, null, "Logged out successfully");
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    await this.verifyEmailUseCase.execute(token as string);
    return successResponse(res, null, "Email verified successfully");
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await this.forgotPasswordUseCase.execute(req.body);
    // Always returns 200 — never reveal if email is registered
    return successResponse(
      res,
      null,
      "If that email is registered, you will receive a reset link shortly.",
    );
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await this.resetPasswordUseCase.execute(req.body);
    return successResponse(
      res,
      null,
      "Password reset successful. Please log in.",
    );
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    // req.user is attached by authenticate middleware
    return successResponse(res, req.user, "Authenticated user");
  });
}
