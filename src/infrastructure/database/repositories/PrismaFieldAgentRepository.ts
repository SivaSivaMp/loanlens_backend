import {
  FieldAgent,
  FieldAgentDetail,
  FieldAgentListItem,
  UpdateFieldAgentData,
} from "@/domian/entities/FieldAgent";
import {
  AgentFilters,
  IFieldAgentRepository,
  PaginatedAgents,
} from "@/domian/repositories/IFieldAgentRepository";
import { PrismaClient } from "@prisma/client";
import {
  blockAgent,
  unblockAgent,
} from "@/infrastructure/cache/agentBlocklist";

export class PrismaFieldAgentRepository implements IFieldAgentRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<FieldAgent | null> {
    const row = await this.db.fieldAgentDSA.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByUserId(userId: string): Promise<FieldAgent | null> {
    const row = await this.db.fieldAgentDSA.findUnique({ where: { userId } });
    return row ? this.map(row) : null;
  }

  async findDetailById(
    agentId: string,
    companyDsaId: string,
  ): Promise<FieldAgentDetail | null> {
    const row = await this.db.fieldAgentDSA.findFirst({
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

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));

    // Use Promise.all instead of $transaction to preserve include types
    const [rows, total] = await Promise.all([
      this.db.fieldAgentDSA.findMany({
        where,
        skip: (page - 1) * limit,
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
      this.db.fieldAgentDSA.count({ where }),
    ]);

    // Count applications per agent for this month in a single groupBy query
    const appCounts = await this.db.loanApplication.groupBy({
      by: ["fieldAgentId"],
      where: {
        fieldAgentId: { in: rows.map((r) => r.id) },
        appliedAt: { gte: monthStart }, // LoanApplication date field
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
        searchesThisMonth: 0, // Week 5 adds SavedSearch tracking
        applicationsThisMonth: appCountMap[r.id] ?? 0,
        expectedCommissionThisMonth: r.commissions.reduce(
          (sum: number, c: { agentEarning: any }) =>
            sum + Number(c.agentEarning),
          0,
        ),
      },
    }));

    return { data, total, page, limit };
  }

  async deactivate(agentId: string): Promise<FieldAgent> {
    const row = await this.db.fieldAgentDSA.update({
      where: { id: agentId },
      data: { isActive: false },
    });
    // Deactivate the linked user account so they can't log in again
    await this.db.user.update({
      where: { id: row.userId },
      data: { isActive: false },
    });
    // Revoke all B2B refresh tokens so existing "remember me" sessions die
    await this.db.refreshToken.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await blockAgent(row.userId, 15 * 60);
    return this.map(row);
  }

  async reactivate(agentId: string): Promise<FieldAgent> {
    const row = await this.db.fieldAgentDSA.update({
      where: { id: agentId },
      data: { isActive: true },
    });
    // Re-enable the user account so they can log in again
    await this.db.user.update({
      where: { id: row.userId },
      data: { isActive: true },
    });
    // Remove from Redis blocklist so future access tokens are accepted again
    await unblockAgent(row.userId);
    return this.map(row);
  }

  async update(
    agentId: string,
    data: UpdateFieldAgentData,
  ): Promise<FieldAgent> {
    const row = await this.db.fieldAgentDSA.update({
      where: { id: agentId },
      data,
    });
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
