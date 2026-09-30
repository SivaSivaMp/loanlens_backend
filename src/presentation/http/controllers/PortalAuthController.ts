import {
  LoginPortalUserUseCase,
  ResendPortalVerificationUseCase,
  RegisterPortalUserUseCase,
  VerifyPortalEmailUseCase,
  ForgotPasswordPortalUseCase,
  ResetPasswordPortalUseCase,
} from "@/application/use-cases/auth/portal/PortalAuthUseCases";
import { GoogleOAuthUseCase } from "@/application/use-cases/auth/portal/GoogleOAuthUseCase";
import { env } from "@/config/env";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/response";

export class PortalAuthController {
  constructor(
    private readonly registerUseCase: RegisterPortalUserUseCase,
    private readonly loginUseCase: LoginPortalUserUseCase,
    private readonly verifyEmailUseCase: VerifyPortalEmailUseCase,
    private readonly resendVerificationUseCase: ResendPortalVerificationUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordPortalUseCase,
    private readonly resetPasswordUseCase: ResetPasswordPortalUseCase,
    private readonly googleOAuthUseCase: GoogleOAuthUseCase,
  ) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.registerUseCase.execute(req.body);
    return successResponse(res, result, result.message, 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.loginUseCase.execute(req.body);
    return successResponse(res, result, "Login successful");
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    return successResponse(res, req.portalUser, "Authenticated portal user");
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;
    const result = await this.verifyEmailUseCase.execute(token);
    return successResponse(res, result, "Email verified successfully");
  });

  resendVerification = asyncHandler(async (req: Request, res: Response) => {
    await this.resendVerificationUseCase.execute(req.body);
    return successResponse(
      res,
      null,
      "If that email needs verification, a new link has been sent.",
    );
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await this.forgotPasswordUseCase.execute(req.body);
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

  googleCallback = (req: Request, res: Response) => {
    const result = req.user as {
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string; fullName: string };
    };

    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      userId: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
    });

    res.redirect(
      `${env.FRONTEND_URL}/portal/oauth-callback#${params.toString()}`,
    );
  };
}
