import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "@/config/env";
import { GoogleOAuthUseCase, GoogleProfile } from "@/application/use-cases/auth/portal/GoogleOAuthUseCase";

/**
 * Configures the Passport Google OAuth 2.0 strategy for the customer portal.
 *
 * Flow:
 *  1. User hits GET /api/v1/portal/auth/google
 *  2. Passport redirects to Google consent screen
 *  3. Google calls back GET /api/v1/portal/auth/google/callback?code=...
 *  4. Passport exchanges code for profile, calls this verify function
 *  5. We run GoogleOAuthUseCase to find/create PortalUser and issue JWTs
 *  6. The result is placed in req.user by done(null, result)
 *  7. Controller reads req.user and redirects frontend with tokens in URL fragment
 */
export function configureGoogleStrategy(googleOAuthUseCase: GoogleOAuthUseCase) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn(
      "⚠️  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google OAuth route will be unavailable.",
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `/api/v1/portal/auth/google/callback`,
        // Passport will use the Host header to resolve the full callback URL
        proxy: true,
      },
      async (_accessToken, _refreshToken, googleProfile, done) => {
        try {
          const profile: GoogleProfile = {
            googleId: googleProfile.id,
            email: googleProfile.emails?.[0]?.value ?? "",
            fullName: googleProfile.displayName,
          };

          if (!profile.email) {
            return done(new Error("Google account has no email address"));
          }

          const result = await googleOAuthUseCase.execute(profile);
          done(null, result);
        } catch (err) {
          done(err as Error);
        }
      },
    ),
  );
}
