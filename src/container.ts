import "reflect-metadata";
import { container } from "tsyringe";
import { buildContainer } from "./infrastructure/di/container";
import { TOKENS } from "./infrastructure/di/tokens";

// ─── Use-cases ───────────────────────────────────────────────────────────────
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

import {
  DeactivateAgentUseCase,
  GetAgentDetailUseCase,
  GetCompanyProfileUseCase,
  ListAgentsUseCase,
  ReactivateAgentUseCase,
  UpdateCompanyProfileUseCase,
} from "./application/use-cases/dsa/CompanyUseCases";

import {
  ListLeadsUseCase,
  GetLeadDetailUseCase,
  AssignLeadUseCase,
  UpdateLeadStatusUseCase,
  UpdateLeadNotesUseCase,
  CreateLeadUseCase,
} from "./application/use-cases/dsa/LeadUseCases";

import {
  ListCustomersUseCase,
  ToggleCustomerStatusUseCase,
} from "./application/use-cases/dsa/CustomerUseCases";

import {
  DeactivateBankUseCase,
  GetBankProfileUseCase,
  UpdateBankProfileUseCase,
} from "./application/use-cases/bank/BankProfileUseCases";

import {
  CreateProductUseCase,
  GetBankAnalyticsUseCase,
  GetProductDetailUseCase,
  GetProductsUseCase,
  GetRateHistoryUseCase,
  UpdateProductStatusUseCase,
} from "./application/use-cases/bank/ProductUseCases";

import {
  CreateAgreementUseCase,
  CreateSplitRuleUseCase,
  DeleteSplitRuleUseCase,
  ListAgreementsUseCase,
  ListBanksUseCase,
  ListSplitRulesUseCase,
  ToggleAgreementUseCase,
  UpdateSplitRuleUseCase,
} from "./application/use-cases/dsa/AgreementUseCases";

// ─── Controllers ─────────────────────────────────────────────────────────────
import { AuthController } from "./presentation/http/controllers/AuthController";
import { PortalAuthController } from "./presentation/http/controllers/PortalAuthController";
import { DSAController } from "./presentation/http/controllers/DSAController";
import { LeadController } from "./presentation/http/controllers/LeadController";
import { CustomerController } from "./presentation/http/controllers/CustomerController";
import { AgreementController } from "./presentation/http/controllers/AgreementController";
import { BankController } from "./presentation/http/controllers/BankController";
import { ProductController } from "./presentation/http/controllers/ProductController";

// ─── Bootstrap DI container ──────────────────────────────────────────────────
buildContainer();

// ─── Resolve use-cases via TSyringe (auto-wires all dependencies) ─────────────

// B2B Auth
const registerUserUseCase    = container.resolve(RegisterUserUseCase);
const loginUserUseCase       = container.resolve(LoginUserUseCase);
const refreshTokenUseCase    = container.resolve(RefreshTokenUseCase);
const verifyEmailUseCase     = container.resolve(VerifyEmailUseCase);
const resendVerificationUseCase = container.resolve(ResendVerificationUseCase);
const forgotPasswordUseCase  = container.resolve(ForgotPasswordUseCase);
const resetPasswordUseCase   = container.resolve(ResetPasswordUseCase);

// Portal Auth
const registerPortalUserUseCase      = container.resolve(RegisterPortalUserUseCase);
const loginPortalUserUseCase         = container.resolve(LoginPortalUserUseCase);
const verifyPortalEmailUseCase       = container.resolve(VerifyPortalEmailUseCase);
const resendPortalVerificationUseCase = container.resolve(ResendPortalVerificationUseCase);
const forgotPasswordPortalUseCase    = container.resolve(ForgotPasswordPortalUseCase);
const resetPasswordPortalUseCase     = container.resolve(ResetPasswordPortalUseCase);
const googleOAuthUseCase             = container.resolve(GoogleOAuthUseCase);

// Register Passport Google strategy (no-op if env vars not set)
configureGoogleStrategy(googleOAuthUseCase);

// DSA — Company
const getCompanyProfileUseCase   = container.resolve(GetCompanyProfileUseCase);
const updateCompanyProfileUseCase = container.resolve(UpdateCompanyProfileUseCase);
const listAgentsUseCase          = container.resolve(ListAgentsUseCase);
const getAgentDetailUseCase      = container.resolve(GetAgentDetailUseCase);
const deactivateAgentUseCase     = container.resolve(DeactivateAgentUseCase);
const reactivateAgentUseCase     = container.resolve(ReactivateAgentUseCase);

// Bank
const getBankProfileUseCase    = container.resolve(GetBankProfileUseCase);
const updateBankProfileUseCase = container.resolve(UpdateBankProfileUseCase);
const deactivateBankUseCase    = container.resolve(DeactivateBankUseCase);

// Products
const createProductUseCase       = container.resolve(CreateProductUseCase);
const getProductsUseCase         = container.resolve(GetProductsUseCase);
const getProductDetailUseCase    = container.resolve(GetProductDetailUseCase);
const updateProductStatusUseCase = container.resolve(UpdateProductStatusUseCase);
const getRateHistoryUseCase      = container.resolve(GetRateHistoryUseCase);
const getBankAnalyticsUseCase    = container.resolve(GetBankAnalyticsUseCase);

// Agreements & Split Rules
const listBanksUseCase      = container.resolve(ListBanksUseCase);
const listAgreementsUseCase = container.resolve(ListAgreementsUseCase);
const createAgreementUseCase = container.resolve(CreateAgreementUseCase);
const toggleAgreementUseCase = container.resolve(ToggleAgreementUseCase);
const listSplitRulesUseCase  = container.resolve(ListSplitRulesUseCase);
const createSplitRuleUseCase = container.resolve(CreateSplitRuleUseCase);
const updateSplitRuleUseCase = container.resolve(UpdateSplitRuleUseCase);
const deleteSplitRuleUseCase = container.resolve(DeleteSplitRuleUseCase);

// Leads
const listLeadsUseCase        = container.resolve(ListLeadsUseCase);
const getLeadDetailUseCase    = container.resolve(GetLeadDetailUseCase);
const assignLeadUseCase       = container.resolve(AssignLeadUseCase);
const updateLeadStatusUseCase = container.resolve(UpdateLeadStatusUseCase);
const updateLeadNotesUseCase  = container.resolve(UpdateLeadNotesUseCase);
const createLeadUseCase       = container.resolve(CreateLeadUseCase);

// ─── Controllers (still constructed manually — they receive use-cases not DI tokens) ─
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
  reactivateAgentUseCase,
);

export const leadController = new LeadController(
  listLeadsUseCase,
  getLeadDetailUseCase,
  assignLeadUseCase,
  updateLeadStatusUseCase,
  updateLeadNotesUseCase,
  createLeadUseCase,
);

export const customerController = new CustomerController(
  container.resolve(ListCustomersUseCase),
  container.resolve(ToggleCustomerStatusUseCase),
);

export const agreementController = new AgreementController(
  listBanksUseCase,
  listAgreementsUseCase,
  createAgreementUseCase,
  toggleAgreementUseCase,
  listSplitRulesUseCase,
  createSplitRuleUseCase,
  updateSplitRuleUseCase,
  deleteSplitRuleUseCase,
);

export const bankController = new BankController(
  getBankProfileUseCase,
  updateBankProfileUseCase,
  deactivateBankUseCase,
  getBankAnalyticsUseCase,
);

export const productController = new ProductController(
  createProductUseCase,
  getProductsUseCase,
  getProductDetailUseCase,
  updateProductStatusUseCase,
  getRateHistoryUseCase,
);
