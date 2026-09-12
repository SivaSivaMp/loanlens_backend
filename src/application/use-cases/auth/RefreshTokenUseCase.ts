import { ITokenService } from "@/application/interfaces/ITokenService";
import { InvalidTokenError, UserNotFoundError } from "@/domian/errors/errors";
import { IUserRepository } from "@/domian/repositories/IUserRepository";

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(oldRefreshToken: string): Promise<RefreshResult> {
    let payload: { userId: string };
    try {
      payload = this.tokenService.verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new InvalidTokenError("Invalid refresh token");
    }

    const storedToken = await this.userRepo.findRefreshToken(oldRefreshToken);
    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new InvalidTokenError("Refresh token is invalid or expired");
    }

    const user = await this.userRepo.findById(payload.userId);
    if (!user) throw new UserNotFoundError();

    await this.userRepo.revokeRefreshToken(storedToken.id);

    const newAccessToken = this.tokenService.signAccessToken({
      userId: user.id,
      role: user.role,
    });

    // Generate a new refresh token and persist it.
    // Each call to signRefreshToken now embeds a random jti so tokens are
    // always unique even when two requests race at the same millisecond.
    // The try-catch below is a last-resort guard for any residual collision.
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    let newRefreshToken = this.tokenService.signRefreshToken(user.id);
    try {
      await this.userRepo.createRefreshToken(user.id, newRefreshToken, expiresAt);
    } catch (err: any) {
      if (err?.code === "P2002") {
        // Unique constraint violation — extremely rare with jti, but retry once
        newRefreshToken = this.tokenService.signRefreshToken(user.id);
        await this.userRepo.createRefreshToken(user.id, newRefreshToken, expiresAt);
      } else {
        throw err;
      }
    }

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
