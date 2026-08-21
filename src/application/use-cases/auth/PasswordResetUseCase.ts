import crypto from "crypto";
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from "@/application/dtos/auth/auth.dto";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { IUserRepository } from "@/domian/repositories/IUserRepository";
import { IHashService } from "@/application/interfaces/IHashService";
import { InvalidTokenError } from "@/domian/errors/errors";

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepo.createPasswordResetToken(user.id, token, expiresAt);
    await this.emailService.sendPasswordResetEmail(user.email, token);
  }
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const record = await this.userRepo.findPasswordResetToken(dto.token);

    if (!record) throw new InvalidTokenError("Invalid or expired reset link");
    if (record.used)
      throw new InvalidTokenError("This reset link has already been used");
    if (record.expiresAt < new Date())
      throw new InvalidTokenError(
        "Reset link has expired. Please request a new one.",
      );

    const passwordHash = await this.hashService.hash(dto.newPassword);

    await this.userRepo.updatePassword(record.userId, passwordHash);
    await this.userRepo.markPasswordResetTokenUsed(record.id);
    // Revoke all refresh tokens on password reset (security best practice)
    await this.userRepo.revokeAllUserRefreshTokens(record.userId);
  }
}
