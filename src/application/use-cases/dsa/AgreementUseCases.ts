//List Bank

import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import {
  BankListQueryDto,
  CreateAgreementDto,
  CreateSplitRuleDto,
  ToggleAgreementDto,
  UpdateSplitRuleDto,
} from "@/application/dtos/dsa/dsa.dto";
import {
  AgreementAlreadyExistsError,
  AgreementNotFoundError,
  CompanyNotFoundError,
  SplitRuleNotFoundError,
  SplitRuleOwnershipError,
} from "@/domain/errors/errors";
import { CommissionSplitRuleDomain } from "@/domain/entities/Agreement";
import { IAgreementRepository } from "@/domain/repositories/IAgreementRepository";
import { ICompanyDSARepository } from "@/domain/repositories/ICompanyDSARepository";

//List Banks

@injectable()
export class ListBanksUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IAgreementRepository) private readonly agreementRepo: IAgreementRepository,
  ) {}
  async execute(userId: string, query: BankListQueryDto) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    return this.agreementRepo.listBanks(company.id, {
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }
}

//List Own Agreements

@injectable()
export class ListAgreementsUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IAgreementRepository) private readonly agreementRepo: IAgreementRepository,
  ) {}
  async execute(userId: string, isActive?: boolean) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();
    return this.agreementRepo.findAgreementsByCompany(company.id, isActive);
  }
}

//Create Agreement with a Bank

@injectable()
export class CreateAgreementUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IAgreementRepository) private readonly agreementRepo: IAgreementRepository,
  ) {}

  async execute(userId: string, bankId: string, dto: CreateAgreementDto) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const existing = await this.agreementRepo.findAgreement(company.id, bankId);
    if (existing) throw new AgreementAlreadyExistsError();

    return this.agreementRepo.createAgreement({
      companyDsaId: company.id,
      bankId,
      agreedCommissionRate: dto.agreedCommissionRate,
      notes: dto.notes,
    });
  }
}

//Toggle Agreement

@injectable()
export class ToggleAgreementUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IAgreementRepository) private readonly agreementRepo: IAgreementRepository,
  ) {}
  async execute(userId: string, bankId: string, dto: ToggleAgreementDto) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const existing = await this.agreementRepo.findAgreement(company.id, bankId);
    if (!existing) throw new AgreementNotFoundError();

    return this.agreementRepo.toggleAgreement(company.id, bankId, dto.isActive);
  }
}

//  List Split Rules

@injectable()
export class ListSplitRulesUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IAgreementRepository) private readonly agreementRepo: IAgreementRepository,
  ) {}

  async execute(userId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    return this.agreementRepo.findSplitRulesByCompany(company.id);
  }
}

//  Create Split Rule

@injectable()
export class CreateSplitRuleUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IAgreementRepository) private readonly agreementRepo: IAgreementRepository,
  ) {}

  async execute(userId: string, dto: CreateSplitRuleDto) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    return this.agreementRepo.createSplitRule({
      companyDsaId: company.id,
      fieldAgentId: dto.fieldAgentId ?? null,
      productId: dto.productId ?? null,
      agentPercent: dto.agentPercent,
      effectiveFrom: dto.effectiveFrom,
    });
  }
}

//  Update Split Rule

@injectable()
export class UpdateSplitRuleUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IAgreementRepository) private readonly agreementRepo: IAgreementRepository,
  ) {}

  async execute(userId: string, ruleId: string, dto: UpdateSplitRuleDto) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const rule = await this.agreementRepo.findSplitRuleById(ruleId);
    if (!rule) throw new SplitRuleNotFoundError();
    if (!new CommissionSplitRuleDomain(rule).belongsToCompany(company.id)) throw new SplitRuleOwnershipError();

    return this.agreementRepo.updateSplitRule(ruleId, dto);
  }
}

//  Delete Split Rule

@injectable()
export class DeleteSplitRuleUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IAgreementRepository) private readonly agreementRepo: IAgreementRepository,
  ) {}

  async execute(userId: string, ruleId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const rule = await this.agreementRepo.findSplitRuleById(ruleId);
    if (!rule) throw new SplitRuleNotFoundError();
    if (!new CommissionSplitRuleDomain(rule).belongsToCompany(company.id)) throw new SplitRuleOwnershipError();

    await this.agreementRepo.deleteSplitRule(ruleId);
  }
}
