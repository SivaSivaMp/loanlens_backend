import "reflect-metadata";
import { container } from "tsyringe";
import { TOKENS } from "./tokens";

// ─── Infrastructure ──────────────────────────────────────────────────────────
import { prisma } from "@/infrastructure/database/prisma";

// ─── Repositories ────────────────────────────────────────────────────────────
import { PrismaUserRepository } from "@/infrastructure/database/repositories/PrismaUserRepository";
import { PrismaPortalUserRepository } from "@/infrastructure/database/repositories/PrismaPortalUserRepository";
import { PrismaBankRepository } from "@/infrastructure/database/repositories/PrismaBankRepository";
import { PrismaLoanProductRepository } from "@/infrastructure/database/repositories/PrismaLoanProductRepository";
import { PrismaCompanyDSARepository } from "@/infrastructure/database/repositories/PrismaCompanyDSARepository";
import { PrismaFieldAgentRepository } from "@/infrastructure/database/repositories/PrismaFieldAgentRepository";
import { PrismaLeadRepository } from "@/infrastructure/database/repositories/PrismaLeadRepository";
import { PrismaAgreementRepository } from "@/infrastructure/database/repositories/PrismaAgreementRepository";

// ─── Services ────────────────────────────────────────────────────────────────
import { BcryptHashService } from "@/infrastructure/services/BcryptHashService";
import { JwtTokenService } from "@/infrastructure/services/JwtTokenService";
import { NodemailerEmailService } from "@/infrastructure/services/NodemailerEmailService";

/**
 * Registers all dependencies into the TSyringe IoC container.
 * Call this once at application startup (server.ts / container.ts) before
 * resolving any use-cases or controllers.
 */
export function buildContainer(): typeof container {
  // ─── Prisma singleton ──────────────────────────────────────────────
  container.registerInstance(TOKENS.PrismaClient, prisma);

  // ─── Repositories ──────────────────────────────────────────────────
  container.register(TOKENS.IUserRepository, {
    useClass: PrismaUserRepository,
  });
  container.register(TOKENS.IPortalUserRepository, {
    useClass: PrismaPortalUserRepository,
  });
  container.register(TOKENS.IBankRepository, {
    useClass: PrismaBankRepository,
  });
  container.register(TOKENS.ILoanProductRepository, {
    useClass: PrismaLoanProductRepository,
  });
  container.register(TOKENS.ICompanyDSARepository, {
    useClass: PrismaCompanyDSARepository,
  });
  container.register(TOKENS.IFieldAgentRepository, {
    useClass: PrismaFieldAgentRepository,
  });
  container.register(TOKENS.ILeadRepository, {
    useClass: PrismaLeadRepository,
  });
  container.register(TOKENS.IAgreementRepository, {
    useClass: PrismaAgreementRepository,
  });

  // ─── Services ──────────────────────────────────────────────────────
  container.register(TOKENS.IHashService, { useClass: BcryptHashService });
  container.register(TOKENS.ITokenService, { useClass: JwtTokenService });
  container.register(TOKENS.IEmailService, {
    useClass: NodemailerEmailService,
  });

  return container;
}
