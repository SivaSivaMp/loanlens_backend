export interface FieldAgent {
  id: string
  userId: string
  companyDsaId: string
  fullName: string
  phone: string
  bankAccountNumber: string | null
  ifscCode: string | null
  pan: string | null
  isActive: boolean
  joinedAt: Date
  updatedAt: Date
}

export interface FieldAgentWithEmail extends FieldAgent {
  email: string
}

export interface FieldAgentListItem {
  id: string
  userId: string
  fullName: string
  phone: string
  email: string
  isActive: boolean
  joinedAt: Date
  stats: {
    searchesThisMonth: number
    applicationsThisMonth: number
    expectedCommissionThisMonth: number
  }
}

export interface FieldAgentDetail extends FieldAgentWithEmail {
  splitRule: {
    agentPercent: number
    isDefault: boolean
  } | null
  commissionSummary: {
    expectedTotal: number
    paidTotal: number
  }
}

export interface UpdateFieldAgentData {
  phone?: string
  bankAccountNumber?: string
  ifscCode?: string
  pan?: string
}
