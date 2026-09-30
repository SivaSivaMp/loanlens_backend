import { RefreshToken } from "../User";

export class RefreshTokenVO {
  constructor(private readonly props: RefreshToken) {}

  /** Returns true if the token has passed its expiry date. */
  isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  /** Returns true if the token has been explicitly revoked. */
  isRevoked(): boolean {
    return this.props.revokedAt !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
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
