import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import crypto from "crypto";
import { ResendVerificationDto } from "@/application/dtos/auth/auth.dto";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { IUserRepository } from "@/domain/repositories/IUserRepository";

@injectable()
export class ResendVerificationUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepo: IUserRepository,
    @inject(TOKENS.IEmailService) private readonly emailService: IEmailService,
  ) {}

  async execute(dto: ResendVerificationDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user || user.emailVerified) return;

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userRepo.createEmailVerificationToken(
      user.id,
      verifyToken,
      expiresAt,
    );

    this.emailService
      .sendVerificationEmail(user.email, verifyToken)
      .catch(() => {});
  }
}
