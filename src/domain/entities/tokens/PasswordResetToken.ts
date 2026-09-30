import { PasswordResetToken } from "../User";

export class PasswordResetTokenVO {
  constructor(private readonly props: PasswordResetToken) {}

  /** Returns true if this token has already been consumed. */
  isUsed(): boolean {
    return this.props.used;
  }

  /** Returns true if the token has passed its expiry date. */
  isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isUsed() && !this.isExpired();
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }
}
