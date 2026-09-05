/**
 * composition root
 */

import { LoginUserUseCase } from "./application/use-cases/auth/LoginUserUseCase";
import {
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
} from "./application/use-cases/auth/PasswordResetUseCase";
import {
  LoginPortalUserUseCase,
  ResendPortalVerificationUseCase,
  RegisterPortalUserUseCase,
  VerifyPortalEmailUseCase,
  ForgotPasswordPortalUseCase,
  ResetPasswordPortalUseCase,
} from "./application/use-cases/auth/portal/PortalAuthUseCases";
import { RefreshTokenUseCase } from "./application/use-cases/auth/RefreshTokenUseCase";
import { RegisterUserUseCase } from "./application/use-cases/auth/RegisterUserUseCase";
import { VerifyEmailUseCase } from "./application/use-cases/auth/VerifyEmailUseCase";
import { ResendVerificationUseCase } from "./application/use-cases/auth/ResendVerificationUseCase";
import { prisma } from "./infrastructure/database/prisma";
import { PrismaPortalUserRepository } from "./infrastructure/database/repositories/PrismaPortalUserRepository";
import { PrismaUserRepository } from "./infrastructure/database/repositories/PrismaUserRepository";
import { BcryptHashService } from "./infrastructure/services/BcryptHashService";
import { JwtTokenService } from "./infrastructure/services/JwtTokenService";
import { NodemailerEmailService } from "./infrastructure/services/NodemailerEmailService";
import { AuthController } from "./presentation/http/controllers/AuthController";
import { PortalAuthController } from "./presentation/http/controllers/PortalAuthController";

// ─── Repositories ────────────────────────────────────────────────────────────

const userRepository = new PrismaUserRepository(prisma);
const portalUserRepository = new PrismaPortalUserRepository(prisma);

// ─── Services ────────────────────────────────────────────────────────────────

const tokenService = new JwtTokenService();
const hashService = new BcryptHashService();
const emailService = new NodemailerEmailService();

// ─── B2B Auth Use Cases ──────────────────────────────────────────────────────

const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  hashService,
  emailService,
);
const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  hashService,
  tokenService,
);
const refreshTokenUseCase = new RefreshTokenUseCase(
  userRepository,
  tokenService,
);
const verifyEmailUseCase = new VerifyEmailUseCase(userRepository);
const resendVerificationUseCase = new ResendVerificationUseCase(
  userRepository,
  emailService,
);
const forgotPasswordUseCase = new ForgotPasswordUseCase(
  userRepository,
  emailService,
);
const resetPasswordUseCase = new ResetPasswordUseCase(
  userRepository,
  hashService,
);

// ─── Portal Auth Use Cases ───────────────────────────────────────────────────

const registerPortalUserUseCase = new RegisterPortalUserUseCase(
  portalUserRepository,
  hashService,
  emailService,
);
const loginPortalUserUseCase = new LoginPortalUserUseCase(
  portalUserRepository,
  hashService,
  tokenService,
);
const verifyPortalEmailUseCase = new VerifyPortalEmailUseCase(
  portalUserRepository,
);
const resendPortalVerificationUseCase = new ResendPortalVerificationUseCase(
  portalUserRepository,
  emailService,
);
const forgotPasswordPortalUseCase = new ForgotPasswordPortalUseCase(
  portalUserRepository,
  emailService,
);
const resetPasswordPortalUseCase = new ResetPasswordPortalUseCase(
  portalUserRepository,
  hashService,
);

// ─── Controllers ─────────────────────────────────────────────────────────────

export const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  refreshTokenUseCase,
  verifyEmailUseCase,
  forgotPasswordUseCase,
  resetPasswordUseCase,
  resendVerificationUseCase,
);

export const portalAuthController = new PortalAuthController(
  registerPortalUserUseCase,
  loginPortalUserUseCase,
  verifyPortalEmailUseCase,
  resendPortalVerificationUseCase,
  forgotPasswordPortalUseCase,
  resetPasswordPortalUseCase,
);
