import {
  EmailVerificationToken,
  PasswordResetToken,
  RefreshToken,
  User,
} from "@/domian/entities/User";
import {
  CreateUserData,
  IUserRepository,
} from "@/domian/repositories/IUserRepository";
import { PrismaClient } from "@prisma/client";
import { date } from "zod";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}
  //user

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
  async updateEmailVerified(userId: string): Promise<void> {
    await this.db.user.update({
      where: { userId },
      data: { emailVerified: true },
    });
  }

  //refresh token

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const rt = this.db.refreshToken.create({
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

  //passawrord reset tokern

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

  //email verification token

  async createEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<EmailVerificationToken> {
    // Delete any existing token for this user before creating new one
    await this.db.emailVerificationToken.deleteMany({ where: { userId } });
    const evt = await this.db.emailVerificationToken.create({
      data: { userId, token, expiresAt },
    });
    return this.mapEmailVerificationToken(evt);
  }

  async findEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationToken | null> {
    const evt = await this.db.emailVerificationToken.findUnique({
      where: { token },
    });
    return evt ? this.mapEmailVerificationToken(evt) : null;
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
