import {
  User,
  RefreshToken,
  PasswordResetToken,
  EmailVerificationToken,
} from "../entities/User";
import { UserRole } from "../entities/User";

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  updateEmailVerified(userId: string): Promise<void>;

  // Refresh tokens
  createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  revokeRefreshToken(tokenId: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;

  // Password reset tokens
  createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<PasswordResetToken>;
  findPasswordResetToken(token: string): Promise<PasswordResetToken | null>;
  markPasswordResetTokenUsed(tokenId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  // Email verification tokens
  createEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<EmailVerificationToken>;
  findEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationToken | null>;
  deleteEmailVerificationToken(tokenId: string): Promise<void>;
}
