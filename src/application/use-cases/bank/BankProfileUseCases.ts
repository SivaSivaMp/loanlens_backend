//Get Bank Profile

import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import {
  BankAlreadyInactiveError,
  BankNotFoundError,
} from "@/domain/errors/errors";
import { BankDomain } from "@/domain/entities/Bank";
import { IBankRepository } from "@/domain/repositories/IBankRepository";
import { ILoanProductRepository } from "@/domain/repositories/ILoanProductRepository";

@injectable()
export class GetBankProfileUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
  ) {}

  async execute(userId: string) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();
    return bank;
  }
}

// ─── Update Bank Profile ──────────────────────────────────────────────────────

@injectable()
export class UpdateBankProfileUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
  ) {}

  async execute(userId: string, data: Record<string, unknown>) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();
    return this.bankRepo.update(bank.id, data);
  }
}

// ─── Deactivate Bank ──────────────────────────────────────────────────────────

@injectable()
export class DeactivateBankUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
    @inject(TOKENS.ILoanProductRepository) private readonly productRepo: ILoanProductRepository,
  ) {}

  async execute(userId: string) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();
    if (new BankDomain(bank).isAlreadyInactive()) throw new BankAlreadyInactiveError();

    // Deactivate bank AND all its active products atomically (handled in repo)
    await this.bankRepo.deactivate(bank.id);
    // productRepo.deleteProductsByBankId sets all ACTIVE products to INACTIVE
    await this.productRepo.deleteProductsByBankId(bank.id);
  }
}
