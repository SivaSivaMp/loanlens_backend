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
    // 1. Verify JWT signature
    let payload: { userId: string };
    try {
      payload = this.tokenService.verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new InvalidTokenError("Invalid refresh token");
    }

    // 2. Check token exists and is not revoked in DB
    const storedToken = await this.userRepo.findRefreshToken(oldRefreshToken);
    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new InvalidTokenError("Refresh token is invalid or expired");
    }

    // 3. Find the user
    const user = await this.userRepo.findById(payload.userId);
    if (!user) throw new UserNotFoundError();

    // 4. ROTATION: revoke old token, issue new one
    await this.userRepo.revokeRefreshToken(storedToken.id);

    const newAccessToken = this.tokenService.signAccessToken({
      userId: user.id,
      role: user.role,
    });
    const newRefreshToken = this.tokenService.signRefreshToken(user.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.userRepo.createRefreshToken(user.id, newRefreshToken, expiresAt);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
