import {
  CreateUserData,
  CreateUserWithProfileData,
  IUserRepository,
} from "@/domian/repositories/IUserRepository";
import { ResourceNotFoundError } from "@/domian/errors/errors";
import { PrismaClient } from "@prisma/client";
import {
  User,
  RefreshToken,
  PasswordResetToken,
  EmailVerificationToken,
} from "@/domian/entities/User";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  //  User

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { email } });
    return user ? this.mapUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { id } });
    return user ? this.mapUser(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.db.user.create({ data });
    return this.mapUser(user);
  }

  async createWithProfile(data: CreateUserWithProfileData): Promise<User> {
    const user = await this.db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
        },
      });

      if (data.role === "BANK_ADMIN" && data.bank) {
        await tx.bank.create({
          data: {
            userId: createdUser.id,
            name: data.bank.name,
            type: data.bank.type,
            contactEmail: data.bank.contactEmail,
            contactPhone: data.bank.contactPhone,
            gstin: data.bank.gstin,
            licenceNumber: data.bank.licenceNumber,
            websiteUrl: data.bank.websiteUrl,
          },
        });
      }

      if (data.role === "COMPANY_DSA" && data.companyDsa) {
        await tx.companyDSA.create({
          data: {
            userId: createdUser.id,
            companyName: data.companyDsa.companyName,
            companyCode: data.companyDsa.companyCode,
            gstin: data.companyDsa.gstin,
          },
        });
      }

      if (data.role === "FIELD_AGENT" && data.fieldAgent) {
        const company = await tx.companyDSA.findUnique({
          where: { companyCode: data.fieldAgent.companyCode },
          select: { id: true },
        });

        if (!company) {
          throw new ResourceNotFoundError("Company DSA");
        }

        await tx.fieldAgentDSA.create({
          data: {
            userId: createdUser.id,
            companyDsaId: company.id,
            fullName: data.fieldAgent.fullName,
            phone: data.fieldAgent.phone,
            bankAccountNumber: data.fieldAgent.bankAccountNumber,
            ifscCode: data.fieldAgent.ifscCode,
            pan: data.fieldAgent.pan,
          },
        });
      }

      return createdUser;
    });

    return this.mapUser(user);
  }

  async updateEmailVerified(userId: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  // ─── Refresh Tokens ───────────────────────────────────────────────────────

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const rt = await this.db.refreshToken.create({
      data: { userId, token, expiresAt },
    });
    return this.mapRefreshToken(rt);
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const rt = await this.db.refreshToken.findUnique({ where: { token } });
    return rt ? this.mapRefreshToken(rt) : null;
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.db.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  //  Password Reset Tokens

  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<PasswordResetToken> {
    const prt = await this.db.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });
    return this.mapPasswordResetToken(prt);
  }

  async findPasswordResetToken(
    token: string,
  ): Promise<PasswordResetToken | null> {
    const prt = await this.db.passwordResetToken.findUnique({
      where: { token },
    });
    return prt ? this.mapPasswordResetToken(prt) : null;
  }

  async markPasswordResetTokenUsed(tokenId: string): Promise<void> {
    await this.db.passwordResetToken.update({
      where: { id: tokenId },
      data: { used: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  //  Email Verification Tokens

  async createEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<EmailVerificationToken> {
    // Delete any existing token for this user before creating a new one
    await this.db.emailVerificationToken.deleteMany({ where: { userId } });
    const evt = await this.db.emailVerificationToken.create({
      data: { userId, token, expiresAt },
    });
    return this.mapEmailVerificationToken(evt);
  }

  async findEmailVerificationToken(
    token: string,
  ): Promise<(EmailVerificationToken & { user: User | null }) | null> {
    const evt = await this.db.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!evt) return null;
    return {
      ...this.mapEmailVerificationToken(evt),
      user: evt.user ? this.mapUser(evt.user) : null,
    };
  }

  async deleteEmailVerificationToken(tokenId: string): Promise<void> {
    await this.db.emailVerificationToken.delete({ where: { id: tokenId } });
  }

  private mapUser(p: any): User {
    return {
      id: p.id,
      email: p.email,
      passwordHash: p.passwordHash,
      role: p.role,
      isActive: p.isActive,
      emailVerified: p.emailVerified,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private mapRefreshToken(p: any): RefreshToken {
    return {
      id: p.id,
      token: p.token,
      userId: p.userId,
      expiresAt: p.expiresAt,
      revokedAt: p.revokedAt,
      createdAt: p.createdAt,
    };
  }

  private mapPasswordResetToken(p: any): PasswordResetToken {
    return {
      id: p.id,
      token: p.token,
      userId: p.userId,
      expiresAt: p.expiresAt,
      used: p.used,
      createdAt: p.createdAt,
    };
  }

  private mapEmailVerificationToken(p: any): EmailVerificationToken {
    return {
      id: p.id,
      token: p.token,
      userId: p.userId,
      expiresAt: p.expiresAt,
      createdAt: p.createdAt,
    };
  }
}
