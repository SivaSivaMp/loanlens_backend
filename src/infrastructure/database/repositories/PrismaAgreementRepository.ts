import {
  BankAgreement,
  BankAgreementWithBank,
  CommissionSplitRule,
  CommissionSplitRuleListItem,
  CreateAgreementData,
  CreateSplitRuleData,
  ResolvedSplitRule,
  UpdateSplitRuleData,
} from "@/domain/entities/Agreement";
import {
  BankListFilters,
  BankListItem,
  IAgreementRepository,
  PaginatedBanks,
} from "@/domain/repositories/IAgreementRepository";
import { PrismaClient } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";

@injectable()
export class PrismaAgreementRepository implements IAgreementRepository {
  constructor(@inject(TOKENS.PrismaClient) private readonly db: PrismaClient) {}

  //  Bank listing
  async listBanks(
    companyDsaId: string,
    filters: BankListFilters,
  ): Promise<PaginatedBanks> {
    const where = filters.search
      ? {
          name: { contains: filters.search, mode: "insensitive" as const },
          isActive: true,
        }
      : { isActive: true };

    const [banks, total] = await Promise.all([
      this.db.bank.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { name: "asc" },
        include: {
          _count: { select: { products: { where: { status: "ACTIVE" } } } },
          agreements: { where: { companyDsaId }, take: 1 },
        },
      }),
      this.db.bank.count({ where }),
    ]);

    const data: BankListItem[] = banks.map((b) => {
      const agr = b.agreements[0] ?? null;
      return {
        id: b.id,
        userId: b.userId,
        name: b.name,
        type: b.type as BankListItem["type"],
        logoUrl: b.logoUrl,
        gstin: b.gstin,
        licenceNumber: b.licenceNumber,
        contactEmail: b.contactEmail,
        contactPhone: b.contactPhone,
        websiteUrl: b.websiteUrl,
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        productCount: b._count.products,
        agreement: agr
          ? {
              exists: true,
              isActive: agr.isActive,
              agreedCommissionRate: agr.agreedCommissionRate,
              agreementDate: agr.agreementDate,
            }
          : null,
      };
    });

    return { data, total, page: filters.page, limit: filters.limit };
  }

  //  Agreement CRUD
  async findAgreement(
    companyDsaId: string,
    bankId: string,
  ): Promise<BankAgreement | null> {
    const row = await this.db.companyBankAgreement.findUnique({
      where: { companyDsaId_bankId: { companyDsaId, bankId } },
    });
    return row ? this.mapAgreement(row) : null;
  }

  async findAgreementsByCompany(
    companyDsaId: string,
    isActive?: boolean,
  ): Promise<BankAgreementWithBank[]> {
    const rows = await this.db.companyBankAgreement.findMany({
      where: {
        companyDsaId,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: {
        bank: { select: { id: true, name: true, type: true, logoUrl: true } },
      },
      orderBy: { agreementDate: "desc" },
    });

    return rows.map((r) => ({
      ...this.mapAgreement(r),
      bank: {
        id: r.bank.id,
        name: r.bank.name,
        type: r.bank.type,
        logoUrl: r.bank.logoUrl,
      },
    }));
  }

  async createAgreement(data: CreateAgreementData): Promise<BankAgreement> {
    const row = await this.db.companyBankAgreement.create({
      data: {
        companyDsaId: data.companyDsaId,
        bankId: data.bankId,
        agreedCommissionRate: data.agreedCommissionRate ?? null,
        notes: data.notes ?? null,
      },
    });
    return this.mapAgreement(row);
  }

  async toggleAgreement(
    companyDsaId: string,
    bankId: string,
    isActive: boolean,
  ): Promise<BankAgreement> {
    const row = await this.db.companyBankAgreement.update({
      where: { companyDsaId_bankId: { companyDsaId, bankId } },
      data: { isActive },
    });
    return this.mapAgreement(row);
  }

  //  Split Rules
  async findSplitRulesByCompany(
    companyDsaId: string,
  ): Promise<CommissionSplitRuleListItem[]> {
    const rows = await this.db.commissionSplitRule.findMany({
      where: { companyDsaId },
      orderBy: [{ isActive: "desc" }, { effectiveFrom: "desc" }],
      include: {
        product: { select: { name: true } },
      },
    });

    // Get agent names for rules that have fieldAgentId
    const agentIds = rows
      .filter((r) => r.fieldAgentId)
      .map((r) => r.fieldAgentId!);
    const agents = agentIds.length
      ? await this.db.fieldAgentDSA.findMany({
          where: { id: { in: agentIds } },
          select: { id: true, fullName: true },
        })
      : [];
    const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.fullName]));

    return rows.map((r) => ({
      ...this.mapRule(r),
      fieldAgentName: r.fieldAgentId
        ? (agentMap[r.fieldAgentId] ?? null)
        : null,
      productName: r.product?.name ?? null,
      isDefault: !r.fieldAgentId && !r.productId,
    }));
  }

  async findSplitRuleById(id: string): Promise<CommissionSplitRule | null> {
    const row = await this.db.commissionSplitRule.findUnique({ where: { id } });
    return row ? this.mapRule(row) : null;
  }

  async createSplitRule(
    data: CreateSplitRuleData,
  ): Promise<CommissionSplitRule> {
    const row = await this.db.commissionSplitRule.create({
      data: {
        companyDsaId: data.companyDsaId,
        fieldAgentId: data.fieldAgentId ?? null,
        productId: data.productId ?? null,
        agentPercent: data.agentPercent,
        effectiveFrom: data.effectiveFrom ?? new Date(),
      },
    });
    return this.mapRule(row);
  }

  async updateSplitRule(
    id: string,
    data: UpdateSplitRuleData,
  ): Promise<CommissionSplitRule> {
    const row = await this.db.commissionSplitRule.update({
      where: { id },
      data,
    });
    return this.mapRule(row);
  }

  async deleteSplitRule(id: string): Promise<void> {
    await this.db.commissionSplitRule.delete({ where: { id } });
  }

  //  Split Rule Precedence Engine
  // Priority: product+agent > agent-only > product-only > company default
  async resolveRule(
    companyDsaId: string,
    fieldAgentId: string,
    productId: string,
  ): Promise<ResolvedSplitRule> {
    const rules = await this.db.commissionSplitRule.findMany({
      where: {
        companyDsaId,
        isActive: true,
        OR: [
          { fieldAgentId, productId },
          { fieldAgentId, productId: null },
          { fieldAgentId: null, productId },
          { fieldAgentId: null, productId: null },
        ],
      },
      orderBy: { effectiveFrom: "desc" },
    });

    const byPriority = (r: (typeof rules)[0]) => {
      if (r.fieldAgentId && r.productId) return 0;
      if (r.fieldAgentId && !r.productId) return 1;
      if (!r.fieldAgentId && r.productId) return 2;
      return 3;
    };

    const sorted = [...rules].sort((a, b) => byPriority(a) - byPriority(b));
    const winner = sorted[0];

    if (!winner) {
      return { agentPercent: 80, companyPercent: 20, source: "default" };
    }

    const agentPercent = Number(winner.agentPercent);
    const companyPercent = 100 - agentPercent;
    const sourceMap: Record<number, ResolvedSplitRule["source"]> = {
      0: "product+agent",
      1: "agent",
      2: "product",
      3: "default",
    };

    return {
      agentPercent,
      companyPercent,
      source: sourceMap[byPriority(winner)] ?? "default",
    };
  }

  //  Mappers
  private mapAgreement(r: any): BankAgreement {
    return {
      id: r.id,
      companyDsaId: r.companyDsaId,
      bankId: r.bankId,
      agreedCommissionRate: r.agreedCommissionRate
        ? Number(r.agreedCommissionRate)
        : null,
      isActive: r.isActive,
      agreementDate: r.agreementDate,
      notes: r.notes,
    };
  }

  private mapRule(r: any): CommissionSplitRule {
    return {
      id: r.id,
      companyDsaId: r.companyDsaId,
      fieldAgentId: r.fieldAgentId,
      productId: r.productId,
      agentPercent: Number(r.agentPercent),
      effectiveFrom: r.effectiveFrom,
      isActive: r.isActive,
    };
  }
}
