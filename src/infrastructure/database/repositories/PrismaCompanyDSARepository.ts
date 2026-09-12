import { PrismaClient } from "@prisma/client";
import { ICompanyDSARepository } from "@/domian/repositories/ICompanyDSARepository";
import {
  CompanyDSA,
  CompanyDSAWithTeamSummary,
  UpdateCompanyData,
} from "@/domian/entities/CompanyDSA";

export class PrismaCompanyDSARepository implements ICompanyDSARepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserId(userId: string): Promise<CompanyDSA | null> {
    const row = await this.db.companyDSA.findUnique({ where: { userId } });
    return row ? this.map(row) : null;
  }
  async findById(id: string): Promise<CompanyDSA | null> {
    const row = await this.db.companyDSA.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }
  async findByCompanyCode(code: string): Promise<CompanyDSA | null> {
    const row = await this.db.companyDSA.findUnique({
      where: { companyCode: code },
    });
    return row ? this.map(row) : null;
  }
  async getWithTeamSummary(
    userId: string,
  ): Promise<CompanyDSAWithTeamSummary | null> {
    const row = await this.db.companyDSA.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { fieldAgents: true },
        },
        fieldAgents: {
          select: { isActive: true },
        },
      },
    });
    if (!row) return null;

    const totalAgents = row._count.fieldAgents;
    const activeAgents = row.fieldAgents.filter((a) => a.isActive).length;
    const inactiveAgents = totalAgents - activeAgents;

    return {
      ...this.map(row),
      teamSummary: { totalAgents, activeAgents, inactiveAgents },
    };
  }
  async update(
    companyId: string,
    data: UpdateCompanyData,
  ): Promise<CompanyDSA> {
    const row = await this.db.companyDSA.update({
      where: { id: companyId },
      data,
    });
    return this.map(row);
  }

  private map(p: {
    id: string;
    userId: string;
    companyName: string;
    gstin: string | null;
    companyCode: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CompanyDSA {
    return {
      id: p.id,
      userId: p.userId,
      companyName: p.companyName,
      gstin: p.gstin,
      companyCode: p.companyCode,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
