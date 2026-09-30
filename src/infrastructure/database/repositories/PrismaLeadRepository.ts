import { PrismaClient } from '@prisma/client'
import type { ILeadRepository } from '@/domain/repositories/ILeadRepository'
import type {
  LeadListItem,
  LeadFilters,
  PaginatedLeads,
  CreateLeadData,
  LeadStatus,
} from '@/domain/entities/Lead'
import { normalizePagination } from '@/shared/helpers'
import { injectable, inject } from 'tsyringe'
import { TOKENS } from '@/infrastructure/di/tokens'

@injectable()
export class PrismaLeadRepository implements ILeadRepository {
  constructor(@inject(TOKENS.PrismaClient) private readonly db: PrismaClient) {}

  private map(row: {
    id: string
    status: string
    loanType: string
    requiredAmount: number
    customerNote: string | null
    state: string | null
    createdAt: Date
    monthlyIncome: number
    cibilScore: number
    employmentType: string
    existingEmi: number
    portalUser: { id: string; fullName: string }
    fieldAgent: { id: string; fullName: string } | null
  }): LeadListItem {
    return {
      id: row.id,
      status: row.status as LeadStatus,
      loanType: row.loanType as LeadListItem['loanType'],
      requiredAmount: row.requiredAmount,
      interestedProduct: '',
      customerNote: row.customerNote ?? undefined,
      internalNotes: undefined,
      createdAt: row.createdAt.toISOString(),
      portalUser: {
        id: row.portalUser.id,
        fullName: row.portalUser.fullName,
        city: row.state ?? '',
        state: row.state ?? '',
        monthlyIncome: row.monthlyIncome,
        employmentType: row.employmentType,
        cibilScore: row.cibilScore,
        existingEmi: row.existingEmi,
      },
      fieldAgent: row.fieldAgent
        ? { id: row.fieldAgent.id, fullName: row.fieldAgent.fullName }
        : null,
      timeline: [],
    }
  }

  async findAllByCompanyId(
    companyDsaId: string,
    filters: LeadFilters,
  ): Promise<PaginatedLeads> {
    const { page, limit, skip } = normalizePagination(filters.page, filters.limit)

    const where: Record<string, unknown> = { companyDsaId }
    if (filters.status) where.status = filters.status
    if (filters.search) {
      where.portalUser = {
        fullName: { contains: filters.search, mode: 'insensitive' },
      }
    }

    const [rows, total] = await Promise.all([
      this.db.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          portalUser: { select: { id: true, fullName: true } },
          fieldAgent: { select: { id: true, fullName: true } },
        },
      }),
      this.db.lead.count({ where }),
    ])

    return { data: rows.map((r) => this.map(r)), total, page, limit }
  }

  async findById(id: string, companyDsaId: string): Promise<LeadListItem | null> {
    const row = await this.db.lead.findFirst({
      where: { id, companyDsaId },
      include: {
        portalUser: { select: { id: true, fullName: true } },
        fieldAgent: { select: { id: true, fullName: true } },
      },
    })
    if (!row) return null
    return this.map(row)
  }

  async assignAgent(leadId: string, fieldAgentId: string): Promise<LeadListItem> {
    const row = await this.db.lead.update({
      where: { id: leadId },
      data: { fieldAgentId, status: 'ASSIGNED', assignedAt: new Date() },
      include: {
        portalUser: { select: { id: true, fullName: true } },
        fieldAgent: { select: { id: true, fullName: true } },
      },
    })
    return this.map(row)
  }

  async updateStatus(leadId: string, status: LeadStatus): Promise<LeadListItem> {
    const row = await this.db.lead.update({
      where: { id: leadId },
      data: { status },
      include: {
        portalUser: { select: { id: true, fullName: true } },
        fieldAgent: { select: { id: true, fullName: true } },
      },
    })
    return this.map(row)
  }

  async updateNotes(leadId: string, notes: string): Promise<LeadListItem> {
    const row = await this.db.lead.update({
      where: { id: leadId },
      data: { customerNote: notes },
      include: {
        portalUser: { select: { id: true, fullName: true } },
        fieldAgent: { select: { id: true, fullName: true } },
      },
    })
    return this.map(row)
  }

  async create(data: CreateLeadData): Promise<LeadListItem> {
    const row = await this.db.lead.create({
      data: {
        portalUserId:   data.portalUserId,
        companyDsaId:   data.companyDsaId,
        loanType:       data.loanType as any,
        requiredAmount: data.requiredAmount,
        customerNote:   data.customerNote,
        monthlyIncome:  data.monthlyIncome,
        cibilScore:     data.cibilScore,
        employmentType: data.employmentType as any,
        existingEmi:    data.existingEmi,
      },
      include: {
        portalUser: { select: { id: true, fullName: true } },
        fieldAgent: { select: { id: true, fullName: true } },
      },
    })
    return this.map(row)
  }
}
