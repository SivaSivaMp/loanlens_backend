import {
  LoginPortalUserUseCase,
  ResendPortalVerificationUseCase,
  RegisterPortalUserUseCase,
  VerifyPortalEmailUseCase,
  ForgotPasswordPortalUseCase,
  ResetPasswordPortalUseCase,
} from "@/application/use-cases/auth/portal/PortalAuthUseCases";
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
}
