import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import { IPortalUserRepository } from "@/domain/repositories/IPortalUserRepository";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { AccountDisabledError } from "@/domain/errors/errors";

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
}

@injectable()
export class GoogleOAuthUseCase {
  constructor(
    @inject(TOKENS.IPortalUserRepository) private readonly portalUserRepo: IPortalUserRepository,
    @inject(TOKENS.ITokenService) private readonly tokenService: ITokenService,
  ) {}

  async execute(profile: GoogleProfile) {
    let user = await this.portalUserRepo.findByGoogleId(profile.googleId);

    if (!user) {
      user = await this.portalUserRepo.findByEmail(profile.email);
      if (user) {
        await this.portalUserRepo.linkGoogleId(user.id, profile.googleId);

        user = await this.portalUserRepo.findById(user.id);
      }
    }

    if (!user) {
      user = await this.portalUserRepo.create({
        fullName: profile.fullName,
        email: profile.email,
        googleId: profile.googleId,
        passwordHash: null,
        phone: null,
        emailVerified: true,
      });
    }

    if (!user!.isActive) throw new AccountDisabledError();

    const accessToken = this.tokenService.signPortalAccessToken({
      userId: user!.id,
      type: "portal",
    });
    const refreshToken = this.tokenService.signPortalRefreshToken(user!.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.portalUserRepo.createRefreshToken(
      user!.id,
      refreshToken,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user!.id,
        email: user!.email,
        fullName: user!.fullName,
      },
    };
  }
}
