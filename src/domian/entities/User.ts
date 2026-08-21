//Enums
export type UserRole = "BANK_ADMIN" | "COMPANY_DSA" | "FIELD_AGENT";

//entities

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface PasswordResetToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface EmailVerificationToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}
