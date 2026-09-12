import type { ILeadRepository } from "@/domian/repositories/ILeadRepository";
import type { LeadFilters, LeadStatus } from "@/domian/entities/Lead";
import type { ICompanyDSARepository } from "@/domian/repositories/ICompanyDSARepository";
import {
  CompanyNotFoundError,
  LeadNotFoundError,
  PortalUserNotFoundError,
} from "@/domian/errors/errors";
import { PrismaClient } from "@prisma/client";

// List Leads
export class ListLeadsUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly leadRepo: ILeadRepository,
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
export class GetLeadDetailUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly leadRepo: ILeadRepository,
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
export class AssignLeadUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly leadRepo: ILeadRepository,
  ) {}

  async execute(userId: string, leadId: string, fieldAgentId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const lead = await this.leadRepo.findById(leadId, company.id);
    if (!lead) throw new LeadNotFoundError();

    return this.leadRepo.assignAgent(leadId, fieldAgentId);
  }
}

import { IPortalUserRepository } from "@/domian/repositories/IPortalUserRepository";

//  Update Lead Status
export class UpdateLeadStatusUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly leadRepo: ILeadRepository,
    private readonly portalUserRepo: IPortalUserRepository,
  ) {}

  async execute(userId: string, leadId: string, status: LeadStatus) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const lead = await this.leadRepo.findById(leadId, company.id);
    if (!lead) throw new LeadNotFoundError();

    const updated = await this.leadRepo.updateStatus(leadId, status);

    const shouldBeActive = status !== "CLOSED" && status !== "REJECTED";
    await this.portalUserRepo.setActive(lead.portalUser.id, shouldBeActive);

    return updated;
  }
}

//  Update Lead Notes
export class UpdateLeadNotesUseCase {
  constructor(private readonly leadRepo: ILeadRepository) {}

  async execute(leadId: string, notes: string) {
    return this.leadRepo.updateNotes(leadId, notes);
  }
}

//  Create Lead
export class CreateLeadUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly leadRepo: ILeadRepository,
    private readonly db: PrismaClient,
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
