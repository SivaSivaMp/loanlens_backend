/**
 * composition root
 */

import { LoginUserUseCase } from "./application/use-cases/auth/LoginUserUseCase";
import {
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
} from "./application/use-cases/auth/PasswordResetUseCase";
import { RefreshTokenUseCase } from "./application/use-cases/auth/RefreshTokenUseCase";
import { RegisterUserUseCase } from "./application/use-cases/auth/RegisterUserUseCase";
import { VerifyEmailUseCase } from "./application/use-cases/auth/VerifyEmailUseCase";
import { prisma } from "./infrastructure/database/prisma";
import { PrismaUserRepository } from "./infrastructure/database/repositories/PrismaUserRepository";
import { BcryptHashService } from "./infrastructure/services/BcryptHashService";
import { JwtTokenService } from "./infrastructure/services/JwtTokenService";
import { NodemailerEmailService } from "./infrastructure/services/NodemailerEmailService";
import { AuthController } from "./presentation/http/controllers/AuthController";

//instantiate repositories

const userRepository = new PrismaUserRepository(prisma);
//const portalUserRepository

//innstantiate service
const tokenService = new JwtTokenService();
const hashService = new BcryptHashService();
const emailService = new NodemailerEmailService();

//instantiate use cases

// B2B Auth
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
const forgotPasswordUseCase = new ForgotPasswordUseCase(
  userRepository,
  emailService,
);
const resetPasswordUseCase = new ResetPasswordUseCase(
  userRepository,
  hashService,
);

export const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  refreshTokenUseCase,
  verifyEmailUseCase,
  forgotPasswordUseCase,
  resetPasswordUseCase,
);
