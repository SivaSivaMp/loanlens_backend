/**
 * String tokens for TSyringe dependency injection.
 *
 * Each token is the unique string key that maps a concrete class to its
 * interface. Use these constants everywhere — never use raw strings.
 */
export const TOKENS = {
  // ─── Infrastructure ────────────────────────────────────────────────
  PrismaClient: "PrismaClient",

  // ─── Repositories ──────────────────────────────────────────────────
  IUserRepository: "IUserRepository",
  IPortalUserRepository: "IPortalUserRepository",
  IBankRepository: "IBankRepository",
  ILoanProductRepository: "ILoanProductRepository",
  ICompanyDSARepository: "ICompanyDSARepository",
  IFieldAgentRepository: "IFieldAgentRepository",
  ILeadRepository: "ILeadRepository",
  IAgreementRepository: "IAgreementRepository",

  // ─── Services ──────────────────────────────────────────────────────
  IHashService: "IHashService",
  ITokenService: "ITokenService",
  IEmailService: "IEmailService",
} as const;

export type TokenKey = keyof typeof TOKENS;
