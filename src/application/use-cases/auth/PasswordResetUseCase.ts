import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import crypto from "crypto";
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from "@/application/dtos/auth/auth.dto";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IHashService } from "@/application/interfaces/IHashService";
import { InvalidTokenError } from "@/domain/errors/errors";
import { PasswordResetTokenVO } from "@/domain/entities/tokens/PasswordResetToken";

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepo: IUserRepository,
    @inject(TOKENS.IEmailService) private readonly emailService: IEmailService,
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

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepo: IUserRepository,
    @inject(TOKENS.IHashService) private readonly hashService: IHashService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const record = await this.userRepo.findPasswordResetToken(dto.token);

    if (!record) throw new InvalidTokenError("Invalid or expired reset link");

    const tokenVO = new PasswordResetTokenVO(record);
    if (tokenVO.isUsed())
      throw new InvalidTokenError("This reset link has already been used");
    if (tokenVO.isExpired())
      throw new InvalidTokenError(
        "Reset link has expired. Please request a new one.",
      );

    const passwordHash = await this.hashService.hash(dto.newPassword);

    await this.userRepo.updatePassword(record.userId, passwordHash);
    await this.userRepo.markPasswordResetTokenUsed(record.id);

    await this.userRepo.revokeAllUserRefreshTokens(record.userId);
  }
}
