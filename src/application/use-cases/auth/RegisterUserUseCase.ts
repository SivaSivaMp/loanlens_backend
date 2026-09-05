import crypto from "crypto";
import { RegisterUserDto } from "@/application/dtos/auth/auth.dto";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { IHashService } from "@/application/interfaces/IHashService";
import { UserRole } from "@/domian/entities/User";
import { EmailAlreadyExistsError } from "@/domian/errors/errors";
import { IUserRepository } from "@/domian/repositories/IUserRepository";

export interface RegisterUserResult {
  userId: string;
  message: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly emailService: IEmailService,
  ) {}
  async execute(dto: RegisterUserDto): Promise<RegisterUserResult> {
    //check for already exsting email
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new EmailAlreadyExistsError();

    //hash password
    const passwordHash = await this.hashService.hash(dto.password);

    //create user

    const user = await this.userRepo.createWithProfile({
      email: dto.email,
      passwordHash,
      role: dto.role as UserRole,
      bank:
        dto.role === "BANK_ADMIN"
          ? {
              name: dto.name!,
              type: dto.type!,
              contactEmail: dto.contactEmail || dto.email,
              contactPhone: dto.contactPhone,
              gstin: dto.gstin,
              licenceNumber: dto.licenceNumber,
              websiteUrl: dto.websiteUrl || undefined,
            }
          : undefined,
      companyDsa:
        dto.role === "COMPANY_DSA"
          ? {
              companyName: dto.companyName!,
              companyCode: dto.companyCode!,
              gstin: dto.gstin,
            }
          : undefined,
      fieldAgent:
        dto.role === "FIELD_AGENT"
          ? {
              companyCode: dto.companyCode!,
              fullName: dto.fullName!,
              phone: dto.phone!,
              bankAccountNumber: dto.bankAccountNumber,
              ifscCode: dto.ifscCode,
              pan: dto.pan,
            }
          : undefined,
    });

    //email verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.userRepo.createEmailVerificationToken(
      user.id,
      verifyToken,
      expiresAt,
    );

    this.emailService
      .sendVerificationEmail(user.email, verifyToken)
      .catch(() => {});
    return {
      userId: user.id,
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }
}
