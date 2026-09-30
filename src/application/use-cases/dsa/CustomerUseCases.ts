// src/application/use-cases/dsa/CustomerUseCases.ts
// Use cases for the Customers page (portal users visible to a DSA company).

import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import { CompanyNotFoundError } from "@/domain/errors/errors";
import { ICompanyDSARepository } from "@/domain/repositories/ICompanyDSARepository";
import {
  IPortalUserRepository,
  PortalUserFilters,
} from "@/domain/repositories/IPortalUserRepository";

// ─── List Customers ───────────────────────────────────────────────────────────
@injectable()
export class ListCustomersUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IPortalUserRepository) private readonly portalUserRepo: IPortalUserRepository,
  ) {}

  async execute(userId: string, filters: PortalUserFilters) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    return this.portalUserRepo.findAllPaginated(company.id, {
      search: filters.search,
      isActive: filters.isActive,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 5,
    });
  }
}

// ─── Toggle Customer Portal Status ───────────────────────────────────────────
// Sets portal_users.isActive + revokes tokens + manages Redis blocklist.
// Uses existing portalUserRepo.setActive() which already handles all of this.
@injectable()
export class ToggleCustomerStatusUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IPortalUserRepository) private readonly portalUserRepo: IPortalUserRepository,
  ) {}

  async execute(userId: string, portalUserId: string, isActive: boolean) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const portalUser = await this.portalUserRepo.findById(portalUserId);
    if (!portalUser) {
      const err: any = new Error("Customer not found");
      err.statusCode = 404;
      err.errorCode = "CUSTOMER_NOT_FOUND";
      throw err;
    }

    await this.portalUserRepo.setActive(portalUserId, isActive);

    return { id: portalUserId, isActive, fullName: portalUser.fullName };
  }
}
