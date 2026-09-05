import crypto from "crypto";
import { ResendVerificationDto } from "@/application/dtos/auth/auth.dto";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { IUserRepository } from "@/domian/repositories/IUserRepository";

/**
 * B2B resend email verification.
 * Silently succeeds even if user is not found or already verified
 * (prevents email enumeration).
 */
export class ResendVerificationUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(dto: ResendVerificationDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);

    // Silently return if user not found or already verified
    if (!user || user.emailVerified) return;

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userRepo.createEmailVerificationToken(
      user.id,
      verifyToken,
      expiresAt,
    );

    // Fire-and-forget — don't block the response on email delivery
    this.emailService
      .sendVerificationEmail(user.email, verifyToken)
      .catch(() => {});
  }
}
