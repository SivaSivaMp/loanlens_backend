import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import {
  AgentListQueryDto,
  UpdateCompanyProfileDto,
} from "@/application/dtos/dsa/dsa.dto";
import {
  AgentAlreadyInactiveError,
  AgentNotFoundError,
  AgentNotInCompanyError,
  CompanyNotFoundError,
} from "@/domain/errors/errors";
import { FieldAgentDomain } from "@/domain/entities/FieldAgent";
import { ICompanyDSARepository } from "@/domain/repositories/ICompanyDSARepository";
import { IFieldAgentRepository } from "@/domain/repositories/IFieldAgentRepository";

//get company profile
@injectable()
export class GetCompanyProfileUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
  ) {}

  async execute(userId: string) {
    const company = await this.companyRepo.getWithTeamSummary(userId);
    if (!company) throw new CompanyNotFoundError();
    return company;
  }
}

//update company profile
@injectable()
export class UpdateCompanyProfileUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
  ) {}
  async execute(userId: string, dto: UpdateCompanyProfileDto) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();
    return this.companyRepo.update(company.id, dto);
  }
}

//List field agent

@injectable()
export class ListAgentsUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IFieldAgentRepository) private readonly agentRepo: IFieldAgentRepository,
  ) {}
  async execute(userId: string, query: AgentListQueryDto) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    return this.agentRepo.findAllByCompanyId(company.id, {
      isActive: query.isActive as boolean | undefined,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });
  }
}
//get agent details

@injectable()
export class GetAgentDetailUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IFieldAgentRepository) private readonly agentRepo: IFieldAgentRepository,
  ) {}
  async execute(userId: string, agentId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const agent = await this.agentRepo.findDetailById(agentId, company.id);
    if (!agent) throw new AgentNotFoundError();
    return agent;
  }
}

//Deactivate Agent

@injectable()
export class DeactivateAgentUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IFieldAgentRepository) private readonly agentRepo: IFieldAgentRepository,
  ) {}

  async execute(userId: string, agentId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const agent = await this.agentRepo.findById(agentId);
    if (!agent) throw new AgentNotFoundError();

    const agentDomain = new FieldAgentDomain(agent);
    if (!agentDomain.belongsToCompany(company.id)) throw new AgentNotInCompanyError();
    if (agentDomain.isAlreadyInactive()) throw new AgentAlreadyInactiveError();

    await this.agentRepo.deactivate(agentId);

    return { agentName: agent.fullName };
  }
}

// Reactivate Agent

@injectable()
export class ReactivateAgentUseCase {
  constructor(
    @inject(TOKENS.ICompanyDSARepository) private readonly companyRepo: ICompanyDSARepository,
    @inject(TOKENS.IFieldAgentRepository) private readonly agentRepo: IFieldAgentRepository,
  ) {}

  async execute(userId: string, agentId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const agent = await this.agentRepo.findById(agentId);
    if (!agent) throw new AgentNotFoundError();

    const agentDomain = new FieldAgentDomain(agent);
    if (!agentDomain.belongsToCompany(company.id)) throw new AgentNotInCompanyError();
    // No-op guard: already active
    if (agentDomain.isActive) return { agentName: agent.fullName };

    await this.agentRepo.reactivate(agentId);

    return { agentName: agent.fullName };
  }
}
