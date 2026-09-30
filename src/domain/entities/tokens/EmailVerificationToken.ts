import { EmailVerificationToken } from "../User";

export class EmailVerificationTokenVO {
  constructor(private readonly props: EmailVerificationToken) {}

  /** Returns true if the verification link has passed its expiry date. */
  isExpired(): boolean {
    return this.props.expiresAt < new Date();
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
