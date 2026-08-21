export type EmploymentType = 'SALARIED' | 'SELF_EMPLOYED' | 'BOTH'

export interface PortalUser {
  id: string
  fullName: string
  phone: string
  email: string
  passwordHash: string
  isActive: boolean
  emailVerified: boolean
  snapshotIncome: number | null
  snapshotEmploymentType: EmploymentType | null
  snapshotCibilScore: number | null
  snapshotExistingEmi: number | null
  createdAt: Date
  updatedAt: Date
}

export interface PortalRefreshToken {
  id: string
  token: string
  portalUserId: string
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
}
