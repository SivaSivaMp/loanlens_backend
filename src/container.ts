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
import { GoogleOAuthUseCase } from "./application/use-cases/auth/portal/GoogleOAuthUseCase";
import { configureGoogleStrategy } from "./infrastructure/auth/passport";
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
import { PrismaCompanyDSARepository } from "./infrastructure/database/repositories/PrismaCompanyDSARepository";
import {
  DeactivateAgentUseCase,
  GetAgentDetailUseCase,
  GetCompanyProfileUseCase,
  ListAgentsUseCase,
  ReactivateAgentUseCase,
  UpdateCompanyProfileUseCase,
} from "./application/use-cases/dsa/CompanyUseCases";
import { PrismaFieldAgentRepository } from "./infrastructure/database/repositories/PrismaFieldAgentRepository";
import { DSAController } from "./presentation/http/controllers/DSAController";
import { PrismaLeadRepository } from "./infrastructure/database/repositories/PrismaLeadRepository";
import {
  ListLeadsUseCase,
  GetLeadDetailUseCase,
  AssignLeadUseCase,
  UpdateLeadStatusUseCase,
  UpdateLeadNotesUseCase,
  CreateLeadUseCase,
} from "./application/use-cases/dsa/LeadUseCases";
import { LeadController } from "./presentation/http/controllers/LeadController";


//  Repositories
//poral and user repositories
const userRepository = new PrismaUserRepository(prisma);
const portalUserRepository = new PrismaPortalUserRepository(prisma);

//company
const companyDSARepository = new PrismaCompanyDSARepository(prisma);
const fieldAgentRepository = new PrismaFieldAgentRepository(prisma);

// Services

const tokenService = new JwtTokenService();
const hashService = new BcryptHashService();
const emailService = new NodemailerEmailService();

// B2B Auth Use Cases

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

// Portal Auth Use Cases

const registerPortalUserUseCase = new RegisterPortalUserUseCase(
  portalUserRepository,
  hashService,
  emailService,
  prisma,
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

const googleOAuthUseCase = new GoogleOAuthUseCase(
  portalUserRepository,
  tokenService,
);

// Register Passport Google strategy (no-op if env vars not set)
configureGoogleStrategy(googleOAuthUseCase);

//company Dsa

const getCompanyProfileUseCase = new GetCompanyProfileUseCase(
  companyDSARepository,
);
const updateCompanyProfileUseCase = new UpdateCompanyProfileUseCase(
  companyDSARepository,
);
const listAgentsUseCase = new ListAgentsUseCase(
  companyDSARepository,
  fieldAgentRepository,
);
const getAgentDetailUseCase = new GetAgentDetailUseCase(
  companyDSARepository,
  fieldAgentRepository,
);
const deactivateAgentUseCase = new DeactivateAgentUseCase(
  companyDSARepository,
  fieldAgentRepository,
);

//  Controllers

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
  googleOAuthUseCase,
);
export const dsaController = new DSAController(
  getCompanyProfileUseCase,
  updateCompanyProfileUseCase,
  listAgentsUseCase,
  getAgentDetailUseCase,
  deactivateAgentUseCase,
  new ReactivateAgentUseCase(companyDSARepository, fieldAgentRepository),
);

// Lead repository & use cases
const leadRepository = new PrismaLeadRepository(prisma);
const listLeadsUseCase = new ListLeadsUseCase(companyDSARepository, leadRepository);
const getLeadDetailUseCase = new GetLeadDetailUseCase(companyDSARepository, leadRepository);
const assignLeadUseCase = new AssignLeadUseCase(companyDSARepository, leadRepository);
const updateLeadStatusUseCase = new UpdateLeadStatusUseCase(companyDSARepository, leadRepository, portalUserRepository);
const updateLeadNotesUseCase = new UpdateLeadNotesUseCase(leadRepository);
const createLeadUseCase = new CreateLeadUseCase(companyDSARepository, leadRepository, prisma);

export const leadController = new LeadController(
  listLeadsUseCase,
  getLeadDetailUseCase,
  assignLeadUseCase,
  updateLeadStatusUseCase,
  updateLeadNotesUseCase,
  createLeadUseCase,
);
