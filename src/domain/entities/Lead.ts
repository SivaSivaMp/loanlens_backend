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

/**
 * Domain class wrapping a Lead entity.
 * Encapsulates business rules about how lead status
 * affects related domain objects.
 */
export class LeadDomain {
  constructor(private readonly props: Lead) {}

  /**
   * Returns true if the portal user linked to this lead should remain active.
   *
   * Business rule: A portal user is deactivated only when their lead
   * reaches a terminal state (CLOSED or REJECTED).
   */
  shouldPortalUserBeActive(): boolean {
    return this.props.status !== 'CLOSED' && this.props.status !== 'REJECTED';
  }

  get id(): string { return this.props.id; }
  get status(): LeadStatus { return this.props.status; }
  get portalUserId(): string { return this.props.portalUserId; }
}

