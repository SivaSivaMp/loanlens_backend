import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import type { ILeadRepository } from "@/domain/repositories/ILeadRepository";
import type { LeadFilters, LeadStatus } from "@/domain/entities/Lead";
import type { ICompanyDSARepository } from "@/domain/repositories/ICompanyDSARepository";
import {
  CompanyNotFoundError,
  LeadNotFoundError,
  PortalUserNotFoundError,
} from "@/domain/errors/errors";
import { LeadStatusPolicy } from "@/domain/domain-services/LeadStatusPolicy";
import { PrismaClient } from "@prisma/client";
import { IPortalUserRepository } from "@/domain/repositories/IPortalUserRepository";

// List Leads
@injectable()
export class ListLeadsUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.ILeadRepository) private readonly leadRepo: ILeadRepository,
  ) {}

  async execute(userId: string, query: LeadFilters) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    return this.leadRepo.findAllByCompanyId(company.id, {
      status: query.status,
      search: query.search,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 15,
    });
  }
}

//  Get Lead Detail
@injectable()
export class GetLeadDetailUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.ILeadRepository) private readonly leadRepo: ILeadRepository,
  ) {}

  async execute(userId: string, leadId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const lead = await this.leadRepo.findById(leadId, company.id);
    if (!lead) throw new LeadNotFoundError();
    return lead;
  }
}

//  Assign Lead
@injectable()
export class AssignLeadUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.ILeadRepository) private readonly leadRepo: ILeadRepository,
  ) {}

  async execute(userId: string, leadId: string, fieldAgentId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const lead = await this.leadRepo.findById(leadId, company.id);
    if (!lead) throw new LeadNotFoundError();

    return this.leadRepo.assignAgent(leadId, fieldAgentId);
  }
}

//  Update Lead Status
@injectable()
export class UpdateLeadStatusUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.ILeadRepository) private readonly leadRepo: ILeadRepository,
    @inject(TOKENS.IPortalUserRepository) private readonly portalUserRepo: IPortalUserRepository,
  ) {}

  async execute(userId: string, leadId: string, status: LeadStatus) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const lead = await this.leadRepo.findById(leadId, company.id);
    if (!lead) throw new LeadNotFoundError();

    const updated = await this.leadRepo.updateStatus(leadId, status);

    const shouldBeActive = LeadStatusPolicy.shouldPortalUserBeActive(status);
    await this.portalUserRepo.setActive(lead.portalUser.id, shouldBeActive);

    return updated;
  }
}

//  Update Lead Notes
@injectable()
export class UpdateLeadNotesUseCase {
  constructor(
    @inject(TOKENS.ILeadRepository) private readonly leadRepo: ILeadRepository,
  ) {}

  async execute(leadId: string, notes: string) {
    return this.leadRepo.updateNotes(leadId, notes);
  }
}

//  Create Lead
@injectable()
export class CreateLeadUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.ILeadRepository) private readonly leadRepo: ILeadRepository,
    @inject(TOKENS.PrismaClient) private readonly db: PrismaClient,
  ) {}

  async execute(
    userId: string,
    dto: {
      portalUserId: string;
      loanType: string;
      requiredAmount: number;
      customerNote?: string;
    },
  ) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    // Fetch portal user to get financial snapshot fields required by Lead model
    const portalUser = await this.db.portalUser.findUnique({
      where: { id: dto.portalUserId },
    });
    if (!portalUser) throw new PortalUserNotFoundError();

    return this.leadRepo.create({
      portalUserId: dto.portalUserId,
      companyDsaId: company.id,
      loanType: dto.loanType as any,
      requiredAmount: dto.requiredAmount,
      customerNote: dto.customerNote,
      monthlyIncome: portalUser.snapshotIncome ?? 0,
      cibilScore: portalUser.snapshotCibilScore ?? 0,
      employmentType: portalUser.snapshotEmploymentType ?? "SALARIED",
      existingEmi: portalUser.snapshotExistingEmi ?? 0,
    });
  }
}
