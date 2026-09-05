import { InvalidTokenError } from "@/domian/errors/errors";
import { IUserRepository } from "@/domian/repositories/IUserRepository";

export class VerifyEmailUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(
    token: string,
  ): Promise<{ status: "success" | "already_verified" }> {
    const record = await this.userRepo.findEmailVerificationToken(token);

    if (!record) throw new InvalidTokenError("Invalid verification link");

    // The record now includes the user relation — check if already verified
    if (record.user?.emailVerified) {
      return { status: "already_verified" };
    }

    if (record.expiresAt < new Date()) {
      throw new InvalidTokenError(
        "Verification link has expired. Please request a new one.",
      );
    }

    await this.userRepo.updateEmailVerified(record.userId);
    await this.userRepo.deleteEmailVerificationToken(record.id);

    return { status: "success" };
  }
}
