import {
  FieldAgent,
  FieldAgentDetail,
  FieldAgentListItem,
  UpdateFieldAgentData,
} from "@/domain/entities/FieldAgent";
import {
  AgentFilters,
  IFieldAgentRepository,
  PaginatedAgents,
} from "@/domain/repositories/IFieldAgentRepository";
import { PrismaClient } from "@prisma/client";
import {
  blockAgent,
  unblockAgent,
} from "@/infrastructure/cache/agentBlocklist";
import { BaseRepository } from "./BaseRepository";
import { normalizePagination } from "@/shared/helpers";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";

@injectable()
export class PrismaFieldAgentRepository
  extends BaseRepository<FieldAgent, never, UpdateFieldAgentData>
  implements IFieldAgentRepository
{
  constructor(@inject(TOKENS.PrismaClient) prisma: PrismaClient) {
    super(prisma, prisma.fieldAgentDSA);
  }

  // override to apply domain mapping
  override async findById(id: string): Promise<FieldAgent | null> {
    const row = await this.prisma.fieldAgentDSA.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByUserId(userId: string): Promise<FieldAgent | null> {
    const row = await this.prisma.fieldAgentDSA.findUnique({ where: { userId } });
    return row ? this.map(row) : null;
  }

  async findDetailById(
    agentId: string,
    companyDsaId: string,
  ): Promise<FieldAgentDetail | null> {
    const row = await this.prisma.fieldAgentDSA.findFirst({
      where: { id: agentId, companyDsaId },
      include: {
        user: { select: { email: true } },
        commissions: {
          // relation on FieldAgentDSA
          select: { agentEarning: true, status: true },
        },
        company: {
          include: {
            splitRules: {
              where: {
                isActive: true,
                OR: [{ fieldAgentId: agentId }, { fieldAgentId: null }],
              },
              orderBy: [{ fieldAgentId: "desc" }, { effectiveFrom: "desc" }],
              take: 1,
            },
          },
        },
      },
    });
    if (!row) return null;

    const splitRuleRow = row.company.splitRules[0] ?? null;
    const expectedTotal = row.commissions.reduce(
      (sum, c) => sum + Number(c.agentEarning),
      0,
    );
    const paidTotal = row.commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + Number(c.agentEarning), 0);

    return {
      ...this.map(row),
      email: row.user.email,
      splitRule: splitRuleRow
        ? {
            agentPercent: Number(splitRuleRow.agentPercent),
            isDefault: !splitRuleRow.fieldAgentId,
          }
        : null,
      commissionSummary: { expectedTotal, paidTotal },
    };
  }

  async findAllByCompanyId(
    companyDsaId: string,
    filters: AgentFilters,
  ): Promise<PaginatedAgents> {
    const where = {
      companyDsaId,
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    };

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { page, limit, skip } = normalizePagination(filters.page, filters.limit);

    const [rows, total] = await Promise.all([
      this.prisma.fieldAgentDSA.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joinedAt: "desc" },
        include: {
          user: { select: { email: true } },
          commissions: {
            where: { createdAt: { gte: monthStart } },
            select: { agentEarning: true },
          },
        },
      }),
      this.prisma.fieldAgentDSA.count({ where }),
    ]);

    const appCounts = await this.prisma.loanApplication.groupBy({
      by: ["fieldAgentId"],
      where: {
        fieldAgentId: { in: rows.map((r) => r.id) },
        appliedAt: { gte: monthStart },
      },
      _count: true,
    });
    const appCountMap = Object.fromEntries(
      appCounts.map((a) => [a.fieldAgentId, a._count]),
    );

    const data: FieldAgentListItem[] = rows.map((r) => ({
      ...this.map(r),
      email: r.user.email,
      stats: {
        searchesThisMonth: 0,
        applicationsThisMonth: appCountMap[r.id] ?? 0,
        expectedCommissionThisMonth: r.commissions.reduce(
          (sum: number, c: { agentEarning: unknown }) =>
            sum + Number(c.agentEarning),
          0,
        ),
      },
    }));

    return { data, total, page, limit };
  }

  async deactivate(agentId: string): Promise<FieldAgent> {
    const row = await this.prisma.fieldAgentDSA.update({
      where: { id: agentId },
      data: { isActive: false },
    });
    await this.prisma.user.update({
      where: { id: row.userId },
      data: { isActive: false },
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await blockAgent(row.userId, 15 * 60);
    return this.map(row);
  }

  async reactivate(agentId: string): Promise<FieldAgent> {
    const row = await this.prisma.fieldAgentDSA.update({
      where: { id: agentId },
      data: { isActive: true },
    });
    await this.prisma.user.update({
      where: { id: row.userId },
      data: { isActive: true },
    });
    await unblockAgent(row.userId);
    return this.map(row);
  }

  // update defined by IFieldAgentRepository with (agentId: string, data)
  async update(agentId: string, data: UpdateFieldAgentData): Promise<FieldAgent> {
    const row = await this.prisma.fieldAgentDSA.update({ where: { id: agentId }, data });
    return this.map(row);
  }

  private map(p: {
    id: string;
    userId: string;
    companyDsaId: string;
    fullName: string;
    phone: string;
    bankAccountNumber: string | null;
    ifscCode: string | null;
    pan: string | null;
    isActive: boolean;
    joinedAt: Date;
    updatedAt: Date;
  }): FieldAgent {
    return {
      id: p.id,
      userId: p.userId,
      companyDsaId: p.companyDsaId,
      fullName: p.fullName,
      phone: p.phone,
      bankAccountNumber: p.bankAccountNumber,
      ifscCode: p.ifscCode,
      pan: p.pan,
      isActive: p.isActive,
      joinedAt: p.joinedAt,
      updatedAt: p.updatedAt,
    };
  }
}
