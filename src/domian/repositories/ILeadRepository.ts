import type { Lead, LeadListItem, LeadFilters, PaginatedLeads, CreateLeadData, LeadStatus } from '@/domian/entities/Lead'

export interface ILeadRepository {
  findAllByCompanyId(companyDsaId: string, filters: LeadFilters): Promise<PaginatedLeads>
  findById(id: string, companyDsaId: string): Promise<LeadListItem | null>
  assignAgent(leadId: string, fieldAgentId: string): Promise<LeadListItem>
  updateStatus(leadId: string, status: LeadStatus): Promise<LeadListItem>
  updateNotes(leadId: string, notes: string): Promise<LeadListItem>
  create(data: CreateLeadData): Promise<LeadListItem>
}
