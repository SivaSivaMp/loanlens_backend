import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import { LoginUserDto } from "@/application/dtos/auth/auth.dto";
import { IHashService } from "@/application/interfaces/IHashService";
import { ITokenService } from "@/application/interfaces/ITokenService";
import {
  AccountDisabledError,
  EmailNotVerifiedError,
  InvalidCredentialsError,
} from "@/domain/errors/errors";
import { UserDomain } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TOKENS.IUserRepository) private readonly userRepo: IUserRepository,
    @inject(TOKENS.IHashService) private readonly hashService: IHashService,
    @inject(TOKENS.ITokenService) private readonly tokenService: ITokenService,
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

    // 3. Check account status via domain rules
    const userDomain = new UserDomain(user);
    if (!userDomain.isAccountActive()) throw new AccountDisabledError();
    if (!userDomain.hasVerifiedEmail()) throw new EmailNotVerifiedError();

    // 4. Generate tokens
    const accessToken = this.tokenService.signAccessToken({
      userId: userDomain.id,
      role: userDomain.role,
    });
    const refreshToken = this.tokenService.signRefreshToken(userDomain.id);

    // 5. Persist refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.userRepo.createRefreshToken(userDomain.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: userDomain.id, email: userDomain.email, role: userDomain.role },
    };
  }
}
