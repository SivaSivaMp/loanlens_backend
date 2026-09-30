import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import {
  LoginUserDto,
  ResendVerificationDto,
  RegisterPortalUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "@/application/dtos/auth/auth.dto";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { IHashService } from "@/application/interfaces/IHashService";
import { ITokenService } from "@/application/interfaces/ITokenService";
import {
  AccountDisabledError,
  EmailAlreadyExistsError,
  EmailNotVerifiedError,
  InvalidCredentialsError,
  InvalidTokenError,
} from "@/domain/errors/errors";
import { IPortalUserRepository } from "@/domain/repositories/IPortalUserRepository";
import crypto from "crypto";

//  Register

@injectable()
export class RegisterPortalUserUseCase {
  constructor(
    @inject(TOKENS.IPortalUserRepository) private readonly portalUserRepo: IPortalUserRepository,
    @inject(TOKENS.IHashService) private readonly hashService: IHashService,
    @inject(TOKENS.IEmailService) private readonly emailService: IEmailService,
  ) {}

  async execute(dto: RegisterPortalUserDto) {
    const existing = await this.portalUserRepo.findByEmail(dto.email);
    if (existing) throw new EmailAlreadyExistsError();

    const passwordHash = await this.hashService.hash(dto.password);
    const user = await this.portalUserRepo.create({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      passwordHash,
    });

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.portalUserRepo.createEmailVerificationToken(
      user.id,
      verifyToken,
      expiresAt,
    );

    // Fire-and-forget — don't block the registration response
    this.emailService
      .sendPortalVerificationEmail(user.email, verifyToken, user.fullName)
      .catch(() => {});

    return {
      userId: user.id,
      message: "Account created. Please verify your email",
    };
  }
}

// Verify Email

@injectable()
export class VerifyPortalEmailUseCase {
  constructor(
    @inject(TOKENS.IPortalUserRepository) private readonly portalUserRepo: IPortalUserRepository,
  ) {}

  async execute(
    token: string,
  ): Promise<{ status: "success" | "already_verified" }> {
    const record = await this.portalUserRepo.findEmailVerificationToken(token);

    if (!record) throw new InvalidTokenError("Invalid verification link");

    if (record.portalUser?.emailVerified) {
      return { status: "already_verified" };
    }

    if (record.expiresAt < new Date()) {
      throw new InvalidTokenError(
        "Verification link has expired. Please request a new one.",
      );
    }

    await this.portalUserRepo.updateEmailVerified(record.portalUserId);

    await this.portalUserRepo.deleteEmailVerificationToken(record.id);

    return { status: "success" };
  }
}

// Resend Verification

@injectable()
export class ResendPortalVerificationUseCase {
  constructor(
    @inject(TOKENS.IPortalUserRepository) private readonly portalUserRepo: IPortalUserRepository,
    @inject(TOKENS.IEmailService) private readonly emailService: IEmailService,
  ) {}

  async execute(dto: ResendVerificationDto): Promise<void> {
    const user = await this.portalUserRepo.findByEmail(dto.email);

    // Silently no-op if user not found or already verified (prevents enumeration)
    if (!user || user.emailVerified) return;

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.portalUserRepo.createEmailVerificationToken(
      user.id,
      verifyToken,
      expiresAt,
    );

    await this.emailService.sendPortalVerificationEmail(
      user.email,
      verifyToken,
      user.fullName,
    );
  }
}

//  Login

@injectable()
export class LoginPortalUserUseCase {
  constructor(
    @inject(TOKENS.IPortalUserRepository) private readonly portalUserRepo: IPortalUserRepository,
    @inject(TOKENS.IHashService) private readonly hashService: IHashService,
    @inject(TOKENS.ITokenService) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginUserDto) {
    const user = await this.portalUserRepo.findByEmail(dto.email);
    if (!user) throw new InvalidCredentialsError();

    // Google-only users have no password — they must use "Sign in with Google"
    if (!user.passwordHash) throw new InvalidCredentialsError();

    const valid = await this.hashService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!valid) throw new InvalidCredentialsError();

    if (!user.isActive) throw new AccountDisabledError();
    if (!user.emailVerified) throw new EmailNotVerifiedError();


    const accessToken = this.tokenService.signPortalAccessToken({
      userId: user.id,
      type: "portal",
    });
    const refreshToken = this.tokenService.signPortalRefreshToken(user.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.portalUserRepo.createRefreshToken(
      user.id,
      refreshToken,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }
}

//  Forgot Password

@injectable()
export class ForgotPasswordPortalUseCase {
  constructor(
    @inject(TOKENS.IPortalUserRepository) private readonly userRepo: IPortalUserRepository,
    @inject(TOKENS.IEmailService) private readonly emailService: IEmailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepo.createPasswordResetToken(user.id, token, expiresAt);
    await this.emailService.sendPortalPasswordResetEmail(user.email, token);
  }
}

// Reset Password

@injectable()
export class ResetPasswordPortalUseCase {
  constructor(
    @inject(TOKENS.IPortalUserRepository) private readonly userRepo: IPortalUserRepository,
    @inject(TOKENS.IHashService) private readonly hashService: IHashService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const record = await this.userRepo.findPasswordResetToken(dto.token);

    if (!record) throw new InvalidTokenError("Invalid or expired reset link");
    if (record.used)
      throw new InvalidTokenError("This reset link has already been used");
    if (record.expiresAt < new Date())
      throw new InvalidTokenError(
        "Reset link has expired. Please request a new one.",
      );

    const passwordHash = await this.hashService.hash(dto.newPassword);

    await this.userRepo.updatePassword(record.portalUserId, passwordHash);
    await this.userRepo.markPasswordResetTokenUsed(record.id);

    await this.userRepo.revokeAllUserRefreshTokens(record.portalUserId);
  }
}
