import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import { InvalidTokenError } from "@/domain/errors/errors";
import { EmailVerificationTokenVO } from "@/domain/entities/tokens/EmailVerificationToken";
import { IUserRepository } from "@/domain/repositories/IUserRepository";

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    token: string,
  ): Promise<{ status: "success" | "already_verified" }> {
    const record = await this.userRepo.findEmailVerificationToken(token);

    if (!record) throw new InvalidTokenError("Invalid verification link");

    if (record.user?.emailVerified) {
      return { status: "already_verified" };
    }

    if (new EmailVerificationTokenVO(record).isExpired()) {
      throw new InvalidTokenError(
        "Verification link has expired. Please request a new one.",
      );
    }

    await this.userRepo.updateEmailVerified(record.userId);
    await this.userRepo.deleteEmailVerificationToken(record.id);

    return { status: "success" };
  }
}
