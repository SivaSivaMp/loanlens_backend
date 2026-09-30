import { PortalUser, PortalRefreshToken } from "../entities/PortalUser";

export interface CreatePortalUserData {
  fullName: string;
  phone?: string | null;
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  emailVerified?: boolean;
}

export interface PortalUserFilters {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface PortalUserListItem {
  id: string
  fullName: string
  email: string
  phone: string | null
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  // Lead status for this DSA company
  hasLead: boolean
  leadId?: string
  leadStatus?: string
}

export interface PaginatedPortalUsers {
  data: PortalUserListItem[]
  total: number
  page: number
  limit: number
}

export interface IPortalUserRepository {
  findByEmail(email: string): Promise<PortalUser | null>;
  findById(id: string): Promise<PortalUser | null>;
  findByGoogleId(googleId: string): Promise<PortalUser | null>;
  create(data: CreatePortalUserData): Promise<PortalUser>;
  updateEmailVerified(userId: string): Promise<void>;
  linkGoogleId(userId: string, googleId: string): Promise<void>;

  // Customer list for DSA
  findAllPaginated(companyDsaId: string, filters: PortalUserFilters): Promise<PaginatedPortalUsers>;

  // Refresh tokens
  createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<PortalRefreshToken>;
  findRefreshToken(token: string): Promise<PortalRefreshToken | null>;
  revokeRefreshToken(tokenId: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;

  // Password reset
  createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findPasswordResetToken(token: string): Promise<{
    id: string;
    portalUserId: string;
    expiresAt: Date;
    used: boolean;
  } | null>;
  markPasswordResetTokenUsed(tokenId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  // Email verification
  createEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findEmailVerificationToken(token: string): Promise<{
    id: string;
    portalUserId: string;
    expiresAt: Date;
    portalUser?: { emailVerified: boolean };
  } | null>;
  deleteEmailVerificationToken(tokenId: string): Promise<void>;

  // Account status
  setActive(userId: string, isActive: boolean): Promise<void>;
}
