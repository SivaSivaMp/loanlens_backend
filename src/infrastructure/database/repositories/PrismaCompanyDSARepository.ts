import { PrismaClient } from "@prisma/client";
import { ICompanyDSARepository } from "@/domain/repositories/ICompanyDSARepository";
import {
  CompanyDSA,
  CompanyDSAWithTeamSummary,
  UpdateCompanyData,
} from "@/domain/entities/CompanyDSA";
import { BaseRepository } from "./BaseRepository";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";

@injectable()
export class PrismaCompanyDSARepository
  extends BaseRepository<CompanyDSA, never, UpdateCompanyData>
  implements ICompanyDSARepository
{
  constructor(@inject(TOKENS.PrismaClient) prisma: PrismaClient) {
    super(prisma, prisma.companyDSA);
  }

  async findByUserId(userId: string): Promise<CompanyDSA | null> {
    const row = await this.prisma.companyDSA.findUnique({ where: { userId } });
    return row ? this.map(row) : null;
  }

  // override to apply domain mapping
  override async findById(id: string): Promise<CompanyDSA | null> {
    const row = await this.prisma.companyDSA.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByCompanyCode(code: string): Promise<CompanyDSA | null> {
    const row = await this.prisma.companyDSA.findUnique({
      where: { companyCode: code },
    });
    return row ? this.map(row) : null;
  }

  async getWithTeamSummary(
    userId: string,
  ): Promise<CompanyDSAWithTeamSummary | null> {
    const row = await this.prisma.companyDSA.findUnique({
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

  // update defined by ICompanyDSARepository with (companyId: string, data)
  async update(companyId: string, data: UpdateCompanyData): Promise<CompanyDSA> {
    const row = await this.prisma.companyDSA.update({ where: { id: companyId }, data });
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
