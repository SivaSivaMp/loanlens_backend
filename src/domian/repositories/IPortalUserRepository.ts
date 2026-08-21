import { PortalUser, PortalRefreshToken } from '../entities/PortalUser'

export interface CreatePortalUserData {
  fullName: string
  phone: string
  email: string
  passwordHash: string
}

export interface IPortalUserRepository {
  findByEmail(email: string): Promise<PortalUser | null>
  findById(id: string): Promise<PortalUser | null>
  create(data: CreatePortalUserData): Promise<PortalUser>
  updateEmailVerified(userId: string): Promise<void>

  // Refresh tokens
  createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<PortalRefreshToken>
  findRefreshToken(token: string): Promise<PortalRefreshToken | null>
  revokeRefreshToken(tokenId: string): Promise<void>

  // Password reset
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>
  findPasswordResetToken(token: string): Promise<{ id: string; portalUserId: string; expiresAt: Date; used: boolean } | null>
  markPasswordResetTokenUsed(tokenId: string): Promise<void>
  updatePassword(userId: string, passwordHash: string): Promise<void>

  // Email verification
  createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<void>
  findEmailVerificationToken(token: string): Promise<{ id: string; portalUserId: string; expiresAt: Date } | null>
  deleteEmailVerificationToken(tokenId: string): Promise<void>
}
