export type LeadStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PROPOSAL_SENT'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CLOSED'

export type LoanType = 'HOME' | 'PERSONAL' | 'CAR' | 'BUSINESS' | 'GOLD' | 'LAP'

export interface Lead {
  id: string
  portalUserId: string
  companyDsaId: string
  fieldAgentId: string | null
  loanType: LoanType
  requiredAmount: number
  customerNote: string | null
  monthlyIncome: number
  cibilScore: number
  employmentType: string
  existingEmi: number
  state: string | null
  status: LeadStatus
  assignedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface LeadPortalUser {
  id: string
  fullName: string
  city: string
  state: string
  monthlyIncome: number
  employmentType: string
  cibilScore: number
  existingEmi: number
}

export interface LeadListItem {
  id: string
  status: LeadStatus
  loanType: LoanType
  requiredAmount: number
  interestedProduct: string
  customerNote?: string
  internalNotes?: string
  createdAt: string
  portalUser: LeadPortalUser
  fieldAgent: { id: string; fullName: string } | null
  timeline: unknown[]
}

export interface LeadFilters {
  status?: LeadStatus
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedLeads {
  data: LeadListItem[]
  total: number
  page: number
  limit: number
}

export interface CreateLeadData {
  portalUserId: string
  companyDsaId: string
  loanType: LoanType
  requiredAmount: number
  customerNote?: string
  monthlyIncome: number
  cibilScore: number
  employmentType: string
  existingEmi: number
}
