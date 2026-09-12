import { PortalRefreshToken, PortalUser } from "@/domian/entities/PortalUser";
import {
  CreatePortalUserData,
  IPortalUserRepository,
} from "@/domian/repositories/IPortalUserRepository";
import { PrismaClient } from "@prisma/client";
import { blockPortalUser, unblockPortalUser } from "@/infrastructure/cache/portalBlocklist";

export class PrismaPortalUserRepository implements IPortalUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByEmail(email: string): Promise<PortalUser | null> {
    const user = await this.db.portalUser.findUnique({ where: { email } });
    return user ? this.mapUser(user) : null;
  }

  async findById(id: string): Promise<PortalUser | null> {
    const user = await this.db.portalUser.findUnique({ where: { id } });
    return user ? this.mapUser(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<PortalUser | null> {
    const user = await this.db.portalUser.findUnique({ where: { googleId } });
    return user ? this.mapUser(user) : null;
  }

  async create(data: CreatePortalUserData): Promise<PortalUser> {
    const user = await this.db.portalUser.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        passwordHash: data.passwordHash ?? null,
        googleId: data.googleId ?? null,
        emailVerified: data.emailVerified ?? false,
      },
    });
    return this.mapUser(user);
  }

  async linkGoogleId(userId: string, googleId: string): Promise<void> {
    await this.db.portalUser.update({
      where: { id: userId },
      data: { googleId, emailVerified: true },
    });
  }

  async updateEmailVerified(userId: string): Promise<void> {
    await this.db.portalUser.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<PortalRefreshToken> {
    const rt = await this.db.portalRefreshToken.create({
      data: { portalUserId: userId, token, expiresAt },
    });
    return {
      id: rt.id,
      token: rt.token,
      portalUserId: rt.portalUserId,
      expiresAt: rt.expiresAt,
      revokedAt: rt.revokedAt,
      createdAt: rt.createdAt,
    };
  }

  async findRefreshToken(token: string): Promise<PortalRefreshToken | null> {
    const rt = await this.db.portalRefreshToken.findUnique({ where: { token } });
    if (!rt) return null;
    return {
      id: rt.id,
      token: rt.token,
      portalUserId: rt.portalUserId,
      expiresAt: rt.expiresAt,
      revokedAt: rt.revokedAt,
      createdAt: rt.createdAt,
    };
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.db.portalRefreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.db.portalRefreshToken.updateMany({
      where: { portalUserId: userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db.portalPasswordResetToken.create({
      data: { portalUserId: userId, token, expiresAt },
    });
  }

  async findPasswordResetToken(token: string): Promise<{
    id: string;
    portalUserId: string;
    expiresAt: Date;
    used: boolean;
  } | null> {
    const prt = await this.db.portalPasswordResetToken.findUnique({ where: { token } });
    if (!prt) return null;
    return {
      id: prt.id,
      portalUserId: prt.portalUserId,
      expiresAt: prt.expiresAt,
      used: prt.used,
    };
  }

  async markPasswordResetTokenUsed(tokenId: string): Promise<void> {
    await this.db.portalPasswordResetToken.update({
      where: { id: tokenId },
      data: { used: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db.portalUser.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async createEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db.portalEmailVerificationToken.deleteMany({
      where: { portalUserId: userId },
    });
    await this.db.portalEmailVerificationToken.create({
      data: { portalUserId: userId, token, expiresAt },
    });
  }

  async findEmailVerificationToken(token: string): Promise<{
    id: string;
    portalUserId: string;
    expiresAt: Date;
    portalUser?: { emailVerified: boolean };
  } | null> {
    const evt = await this.db.portalEmailVerificationToken.findUnique({
      where: { token },
      include: {
        portalUser: { select: { emailVerified: true } },
      },
    });
    if (!evt) return null;
    return {
      id: evt.id,
      portalUserId: evt.portalUserId,
      expiresAt: evt.expiresAt,
      portalUser: { emailVerified: evt.portalUser.emailVerified },
    };
  }

  async deleteEmailVerificationToken(tokenId: string): Promise<void> {
    await this.db.portalEmailVerificationToken.delete({ where: { id: tokenId } });
  }

  async setActive(userId: string, isActive: boolean): Promise<void> {
    await this.db.portalUser.update({
      where: { id: userId },
      data: { isActive },
    });
    if (!isActive) {
      // Revoke all active refresh tokens so re-login is blocked.
      await this.db.portalRefreshToken.updateMany({
        where: { portalUserId: userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      // Write to Redis blocklist — authenticatePortal checks this on every
      // request, so the customer is kicked out on their NEXT API call even
      // while their access token is still cryptographically valid.
      // TTL = 15 min (matches JWT_PORTAL_ACCESS_EXPIRES).
      await blockPortalUser(userId, 15 * 60);
    } else {
      // Remove from blocklist so reactivated users can access portal again.
      await unblockPortalUser(userId);
    }
  }

  private mapUser(p: any): PortalUser {
    return {
      id: p.id,
      fullName: p.fullName,
      phone: p.phone,
      email: p.email,
      passwordHash: p.passwordHash,
      googleId: p.googleId ?? null,
      isActive: p.isActive,
      emailVerified: p.emailVerified,
      snapshotIncome: p.snapshotIncome,
      snapshotEmploymentType: p.snapshotEmploymentType,
      snapshotCibilScore: p.snapshotCibilScore,
      snapshotExistingEmi: p.snapshotExistingEmi,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
