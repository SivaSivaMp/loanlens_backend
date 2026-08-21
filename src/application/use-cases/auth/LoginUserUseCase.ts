import { LoginUserDto } from "@/application/dtos/auth/auth.dto";
import { IHashService } from "@/application/interfaces/IHashService";
import { ITokenService } from "@/application/interfaces/ITokenService";
import {
  AccountDisabledError,
  EmailNotVerifiedError,
  InvalidCredentialsError,
} from "@/domian/errors/errors";
import { IUserRepository } from "@/domian/repositories/IUserRepository";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginUserDto): Promise<LoginResult> {
    // 1. Find user by email
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new InvalidCredentialsError();

    // 2. Verify password
    const valid = await this.hashService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!valid) throw new InvalidCredentialsError();

    // 3. Check account status
    if (!user.isActive) throw new AccountDisabledError();
    if (!user.emailVerified) throw new EmailNotVerifiedError();

    // 4. Generate tokens
    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = this.tokenService.signRefreshToken(user.id);

    // 5. Persist refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.userRepo.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
