import {
  AgentListQueryDto,
  UpdateCompanyProfileDto,
} from "@/application/dtos/dsa/dsa.dto";
import {
  AgentAlreadyInactiveError,
  AgentNotFoundError,
  AgentNotInCompanyError,
  CompanyNotFoundError,
} from "@/domian/errors/errors";
import { ICompanyDSARepository } from "@/domian/repositories/ICompanyDSARepository";
import { IFieldAgentRepository } from "@/domian/repositories/IFieldAgentRepository";

//get company profile
export class GetCompanyProfileUseCase {
  constructor(private readonly companyRepo: ICompanyDSARepository) {}

  async execute(userId: string) {
    const company = await this.companyRepo.getWithTeamSummary(userId);
    if (!company) throw new CompanyNotFoundError();
    return company;
  }
}

//update company profile
export class UpdateCompanyProfileUseCase {
  constructor(private readonly companyRepo: ICompanyDSARepository) {}
  async execute(userId: string, dto: UpdateCompanyProfileDto) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();
    return this.companyRepo.update(company.id, dto);
  }
}

//List field agent

export class ListAgentsUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly agentRepo: IFieldAgentRepository,
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

export class GetAgentDetailUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly agentRepo: IFieldAgentRepository,
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

export class DeactivateAgentUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly agentRepo: IFieldAgentRepository,
  ) {}

  async execute(userId: string, agentId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const agent = await this.agentRepo.findById(agentId);
    if (!agent) throw new AgentNotFoundError();
    if (agent.companyDsaId !== company.id) throw new AgentNotInCompanyError();
    if (!agent.isActive) throw new AgentAlreadyInactiveError();

    await this.agentRepo.deactivate(agentId);

    return { agentName: agent.fullName };
  }
}

// Reactivate Agent

export class ReactivateAgentUseCase {
  constructor(
    private readonly companyRepo: ICompanyDSARepository,
    private readonly agentRepo: IFieldAgentRepository,
  ) {}

  async execute(userId: string, agentId: string) {
    const company = await this.companyRepo.findByUserId(userId);
    if (!company) throw new CompanyNotFoundError();

    const agent = await this.agentRepo.findById(agentId);
    if (!agent) throw new AgentNotFoundError();
    if (agent.companyDsaId !== company.id) throw new AgentNotInCompanyError();
    // No-op guard: already active
    if (agent.isActive) return { agentName: agent.fullName };

    await this.agentRepo.reactivate(agentId);

    return { agentName: agent.fullName };
  }
}
