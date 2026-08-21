import { InvalidTokenError } from "@/domian/errors/errors";
import { IUserRepository } from "@/domian/repositories/IUserRepository";

export class VerifyEmailUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(token: string): Promise<void> {
    const record = await this.userRepo.findEmailVerificationToken(token);

    if (!record) throw new InvalidTokenError("Invalid verification link");
    if (record.expiresAt < new Date())
      throw new InvalidTokenError(
        "Verification link has expired. Please request a new one.",
      );

    await this.userRepo.updateEmailVerified(record.userId);
    await this.userRepo.deleteEmailVerificationToken(record.id);
  }
}
