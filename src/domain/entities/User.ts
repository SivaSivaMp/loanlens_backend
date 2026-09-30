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

export class UserDomain {
  constructor(private readonly props: User) {}

  canLogin(): boolean {
    return this.props.isActive && this.props.emailVerified;
  }

  isAccountActive(): boolean {
    return this.props.isActive;
  }

  hasVerifiedEmail(): boolean {
    return this.props.emailVerified;
  }

  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get role(): UserRole {
    return this.props.role;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
}
