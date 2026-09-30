import { Bank, UpdateBankData } from "../entities/Bank";

export interface IBankRepository {
  findByUserId(userId: string): Promise<Bank | null>;
  findById(id: string): Promise<Bank | null>;
  update(bankId: string, data: UpdateBankData): Promise<Bank>;
  deactivate(bankId: string): Promise<void>;
}
