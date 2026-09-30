import { Bank, UpdateBankData } from "@/domain/entities/Bank";
import { IBankRepository } from "@/domain/repositories/IBankRepository";
import { PrismaClient } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";

@injectable()
export class PrismaBankRepository
  extends BaseRepository<Bank, never, UpdateBankData>
  implements IBankRepository
{
  constructor(@inject(TOKENS.PrismaClient) prisma: PrismaClient) {
    super(prisma, prisma.bank);
  }

  async findByUserId(userId: string): Promise<Bank | null> {
    const bank = await this.prisma.bank.findUnique({ where: { userId } });
    return bank ? this.map(bank) : null;
  }

  // findById inherited from BaseRepository — returns raw Prisma record
  // override to apply domain mapping
  override async findById(id: string): Promise<Bank | null> {
    const bank = await this.prisma.bank.findUnique({ where: { id } });
    return bank ? this.map(bank) : null;
  }

  async deactivate(bankId: string): Promise<void> {
    await this.prisma.bank.update({
      where: { id: bankId },
      data: { isActive: false },
    });
  }

  // ─── update is defined by IBankRepository with (bankId: string, data) ───────
  async update(bankId: string, data: UpdateBankData): Promise<Bank> {
    const bank = await this.prisma.bank.update({
      where: { id: bankId },
      data,
    });
    return this.map(bank);
  }

  // ─── Map Prisma model → Domain entity ─────────────────────────────────────
  private map(p: {
    id: string;
    userId: string;
    name: string;
    type: string;
    logoUrl: string | null;
    gstin: string | null;
    licenceNumber: string | null;
    contactEmail: string;
    contactPhone: string | null;
    websiteUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Bank {
    return {
      id: p.id,
      userId: p.userId,
      name: p.name,
      type: p.type as Bank["type"],
      logoUrl: p.logoUrl,
      gstin: p.gstin,
      licenceNumber: p.licenceNumber,
      contactEmail: p.contactEmail,
      contactPhone: p.contactPhone,
      websiteUrl: p.websiteUrl,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
