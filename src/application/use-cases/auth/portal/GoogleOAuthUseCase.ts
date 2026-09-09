import { IPortalUserRepository } from "@/domian/repositories/IPortalUserRepository";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { AccountDisabledError } from "@/domian/errors/errors";

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
}

export class GoogleOAuthUseCase {
  constructor(
    private readonly portalUserRepo: IPortalUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(profile: GoogleProfile) {
    // 1. Try to find an existing user by their Google ID (returning user via Google)
    let user = await this.portalUserRepo.findByGoogleId(profile.googleId);

    // 2. Not found by Google ID — check if email is already registered (account linking)
    if (!user) {
      user = await this.portalUserRepo.findByEmail(profile.email);
      if (user) {
        // Link Google ID to the existing email/password account
        await this.portalUserRepo.linkGoogleId(user.id, profile.googleId);
        // Reload to get updated record
        user = await this.portalUserRepo.findById(user.id);
      }
    }

    // 3. Brand new user — create account (Google pre-verifies the email)
    if (!user) {
      user = await this.portalUserRepo.create({
        fullName: profile.fullName,
        email: profile.email,
        googleId: profile.googleId,
        passwordHash: null,  // No password for Google OAuth users
        phone: null,         // Collected later in onboarding
        emailVerified: true, // Google already verified this email
      });
    }

    // 4. Enforce business rule: suspended accounts cannot log in
    if (!user!.isActive) throw new AccountDisabledError();

    // 5. Issue LoanLens JWT tokens
    const accessToken = this.tokenService.signPortalAccessToken({
      userId: user!.id,
      type: "portal",
    });
    const refreshToken = this.tokenService.signPortalRefreshToken(user!.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.portalUserRepo.createRefreshToken(user!.id, refreshToken, expiresAt);

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
