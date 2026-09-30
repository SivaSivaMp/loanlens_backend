import {
  FieldAgent,
  FieldAgentListItem,
  FieldAgentDetail,
  UpdateFieldAgentData,
} from '../entities/FieldAgent'

export interface AgentFilters {
  isActive?: boolean
  page?: number
  limit?: number
}

export interface PaginatedAgents {
  data: FieldAgentListItem[]
  total: number
  page: number
  limit: number
}

export interface IFieldAgentRepository {
  findById(id: string): Promise<FieldAgent | null>
  findByUserId(userId: string): Promise<FieldAgent | null>
  findDetailById(agentId: string, companyDsaId: string): Promise<FieldAgentDetail | null>
  findAllByCompanyId(companyDsaId: string, filters: AgentFilters): Promise<PaginatedAgents>
  deactivate(agentId: string): Promise<FieldAgent>
  reactivate(agentId: string): Promise<FieldAgent>
  update(agentId: string, data: UpdateFieldAgentData): Promise<FieldAgent>
}
