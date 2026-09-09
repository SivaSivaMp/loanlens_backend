export type EmploymentType = 'SALARIED' | 'SELF_EMPLOYED' | 'BOTH'

export interface PortalUser {
  id: string
  fullName: string
  phone: string | null          // nullable — Google users may not have a phone yet
  email: string
  passwordHash: string | null   // nullable — Google OAuth users have no password
  googleId: string | null       // Google's sub ID; null for email/password users
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
