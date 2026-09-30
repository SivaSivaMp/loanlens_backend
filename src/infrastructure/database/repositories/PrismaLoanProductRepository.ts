import {
  BankAnalyticsOverview,
  CreateProductData,
  CreateSlabData,
  LoanProduct,
  LoanProductWithSlabs,
  ProductAnalyticRow,
  ProductRateHistory,
  ProductStatus,
  UpdateProductData,
} from "@/domain/entities/LoanProduct";
import {
  CreateRateHistoryData,
  ILoanProductRepository,
  PaginatedProducts,
  ProductFilters,
} from "@/domain/repositories/ILoanProductRepository";
import { Prisma, PrismaClient } from "@prisma/client";
import { normalizePagination } from "@/shared/helpers";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";

@injectable()
export class PrismaLoanProductRepository implements ILoanProductRepository {
  constructor(@inject(TOKENS.PrismaClient) private readonly db: PrismaClient) {}

  // ─── Create product + slabs in a single transaction
  async create(
    data: CreateProductData,
    slabs: CreateSlabData[],
  ): Promise<LoanProductWithSlabs> {
    const product = await this.db.$transaction(async (tx) => {
      const created = await tx.loanProduct.create({
        data: {
          bankId: data.bankId,
          name: data.name,
          description: data.description,
          loanType: data.loanType,
          serviceableStates: data.serviceableStates,
          rateType: data.rateType,
          rateMin: data.rateMin,
          rateMax: data.rateMax,
          minAmount: data.minAmount,
          maxAmount: data.maxAmount,
          minTenureMonths: data.minTenureMonths,
          maxTenureMonths: data.maxTenureMonths,
          minMonthlyIncome: data.minMonthlyIncome,
          maxMonthlyIncome: data.maxMonthlyIncome,
          minAge: data.minAge,
          maxAge: data.maxAge,
          acceptedEmployment: data.acceptedEmployment,
          minEmploymentYears: data.minEmploymentYears,
          minCibilScore: data.minCibilScore,
          processingFeePercent: data.processingFeePercent ?? 0,
          commissionPercent: data.commissionPercent,
          commissionPayoutDays: data.commissionPayoutDays ?? 30,
          commissionNotes: data.commissionNotes,
          requiredDocuments: data.requiredDocuments,
          ltvPercent: data.ltvPercent,
          propertyTypes: data.propertyTypes ?? [],
          status: "DRAFT",
        },
        include: { rateSlabs: true },
      });

      if (slabs.length > 0) {
        await tx.rateSlab.createMany({
          data: slabs.map((s) => ({
            productId: created.id,
            minAmount: s.minAmount,
            maxAmount: s.maxAmount,
            ratePercent: s.ratePercent,
            label: s.label ?? null,
          })),
        });
      }

      return tx.loanProduct.findUniqueOrThrow({
        where: { id: created.id },
        include: { rateSlabs: true },
      });
    });

    return this.mapWithSlabs(product);
  }

  //  Find by ID
  async findById(id: string): Promise<LoanProductWithSlabs | null> {
    const product = await this.db.loanProduct.findUnique({
      where: { id },
      include: { rateSlabs: true },
    });
    return product ? this.mapWithSlabs(product) : null;
  }

  //  List by bank (paginated + filtered)
  async findAllByBankId(
    bankId: string,
    filters: ProductFilters,
  ): Promise<PaginatedProducts> {
    const where: Prisma.LoanProductWhereInput = {
      bankId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.loanType
        ? { loanType: filters.loanType as Prisma.EnumLoanTypeFilter }
        : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: "insensitive" as const } }
        : {}),
    };

    const { skip } = normalizePagination(filters.page, filters.limit);

    const [data, total] = await this.db.$transaction([
      this.db.loanProduct.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.loanProduct.count({ where }),
    ]);

    return {
      data: data.map((p) => this.map(p)),
      total,
      page: filters.page,
      limit: filters.limit,
    };
  }

  // ─── Update product (delete + reinsert slabs if provided)
  async update(
    id: string,
    data: UpdateProductData,
    slabs?: CreateSlabData[],
  ): Promise<LoanProduct> {
    const updated = await this.db.$transaction(async (tx) => {
      const product = await tx.loanProduct.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.serviceableStates !== undefined && {
            serviceableStates: data.serviceableStates,
          }),
          ...(data.rateType !== undefined && { rateType: data.rateType }),
          ...(data.rateMin !== undefined && { rateMin: data.rateMin }),
          ...(data.rateMax !== undefined && { rateMax: data.rateMax }),
          ...(data.minAmount !== undefined && { minAmount: data.minAmount }),
          ...(data.maxAmount !== undefined && { maxAmount: data.maxAmount }),
          ...(data.minTenureMonths !== undefined && {
            minTenureMonths: data.minTenureMonths,
          }),
          ...(data.maxTenureMonths !== undefined && {
            maxTenureMonths: data.maxTenureMonths,
          }),
          ...(data.minMonthlyIncome !== undefined && {
            minMonthlyIncome: data.minMonthlyIncome,
          }),
          ...(data.maxMonthlyIncome !== undefined && {
            maxMonthlyIncome: data.maxMonthlyIncome,
          }),
          ...(data.minAge !== undefined && { minAge: data.minAge }),
          ...(data.maxAge !== undefined && { maxAge: data.maxAge }),
          ...(data.acceptedEmployment !== undefined && {
            acceptedEmployment: data.acceptedEmployment,
          }),
          ...(data.minEmploymentYears !== undefined && {
            minEmploymentYears: data.minEmploymentYears,
          }),
          ...(data.minCibilScore !== undefined && {
            minCibilScore: data.minCibilScore,
          }),
          ...(data.processingFeePercent !== undefined && {
            processingFeePercent: data.processingFeePercent,
          }),
          ...(data.commissionPercent !== undefined && {
            commissionPercent: data.commissionPercent,
          }),
          ...(data.commissionPayoutDays !== undefined && {
            commissionPayoutDays: data.commissionPayoutDays,
          }),
          ...(data.commissionNotes !== undefined && {
            commissionNotes: data.commissionNotes,
          }),
          ...(data.requiredDocuments !== undefined && {
            requiredDocuments: data.requiredDocuments,
          }),
          ...(data.ltvPercent !== undefined && { ltvPercent: data.ltvPercent }),
          ...(data.propertyTypes !== undefined && {
            propertyTypes: data.propertyTypes,
          }),
          ...(data.brochureUrl !== undefined && {
            brochureUrl: data.brochureUrl,
          }),
        },
      });

      // Slab strategy: delete-and-reinsert if slabs provided
      if (slabs !== undefined) {
        await tx.rateSlab.deleteMany({ where: { productId: id } });
        if (slabs.length > 0) {
          await tx.rateSlab.createMany({
            data: slabs.map((s) => ({
              productId: id,
              minAmount: s.minAmount,
              maxAmount: s.maxAmount,
              ratePercent: s.ratePercent,
              label: s.label ?? null,
            })),
          });
        }
      }

      return product;
    });

    return this.map(updated);
  }

  //  Update status
  async updateStatus(id: string, status: ProductStatus): Promise<void> {
    await this.db.loanProduct.update({ where: { id }, data: { status } });
  }

  // ─── Deactivate all products of a bank (used when bank is deactivated)
  async deleteProductsByBankId(bankId: string): Promise<void> {
    await this.db.loanProduct.updateMany({
      where: { bankId, status: "ACTIVE" },
      data: { status: "INACTIVE" },
    });
  }

  // ─── Rate history
  async createRateHistory(data: CreateRateHistoryData): Promise<void> {
    await this.db.productRateHistory.create({
      data: {
        productId: data.productId,
        oldRateMin: data.oldRateMin,
        oldRateMax: data.oldRateMax,
        newRateMin: data.newRateMin,
        newRateMax: data.newRateMax,
        changedById: data.changedById,
        notes: data.notes ?? null,
      },
    });
  }

  async getRateHistory(productId: string): Promise<ProductRateHistory[]> {
    const rows = await this.db.productRateHistory.findMany({
      where: { productId },
      orderBy: { changedAt: "desc" },
      include: { changedBy: { select: { id: true, email: true } } },
    });

    return rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      oldRateMin: r.oldRateMin ?? 0,
      oldRateMax: r.oldRateMax ?? 0,
      newRateMin: r.newRateMin,
      newRateMax: r.newRateMax,
      changedById: r.changedById,
      changedByEmail: r.changedBy.email,
      notes: r.notes,
      changedAt: r.changedAt,
    }));
  }

  // ─── Analytics ────────────────────────────────────────────────────────────────
  async getAnalyticsOverview(bankId: string): Promise<BankAnalyticsOverview> {
    const [statusCounts, applicationCount, disbursedCount] =
      await this.db.$transaction([
        this.db.loanProduct.groupBy({
          by: ["status"],
          where: { bankId },
          _count: true,
        }),
        this.db.loanApplication.count({
          where: { product: { bankId } },
        }),
        this.db.loanApplication.count({
          where: { product: { bankId }, status: "DISBURSED" },
        }),
      ]);

    const countMap = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count]),
    );

    return {
      totalProducts:
        (countMap["DRAFT"] ?? 0) +
        (countMap["ACTIVE"] ?? 0) +
        (countMap["INACTIVE"] ?? 0),
      activeProducts: countMap["ACTIVE"] ?? 0,
      draftProducts: countMap["DRAFT"] ?? 0,
      inactiveProducts: countMap["INACTIVE"] ?? 0,
      totalImpressionsLast30Days: 0, // impressions tracking — Week 5
      totalApplications: applicationCount,
      totalDisbursed: disbursedCount,
    };
  }

  async getProductAnalytics(bankId: string): Promise<ProductAnalyticRow[]> {
    const products = await this.db.loanProduct.findMany({
      where: { bankId },
      select: {
        id: true,
        name: true,
        loanType: true,
        status: true,
        _count: {
          select: {
            applications: true, // Prisma relation name on LoanProduct
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const disbursedCounts = await this.db.loanApplication.groupBy({
      by: ["productId"],
      where: { product: { bankId }, status: "DISBURSED" },
      _count: true,
    });

    const disbursedMap = Object.fromEntries(
      disbursedCounts.map((d) => [d.productId, d._count]),
    );

    return products.map((p) => ({
      productId: p.id,
      productName: p.name,
      loanType: p.loanType as ProductAnalyticRow["loanType"],
      status: p.status as ProductAnalyticRow["status"],
      impressions: 0, // Week 5
      applications: (p as any)._count?.applications ?? 0,
      disbursed: disbursedMap[p.id] ?? 0,
    }));
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────────
  private map(p: any): LoanProduct {
    return {
      id: p.id,
      bankId: p.bankId,
      name: p.name,
      description: p.description,
      brochureUrl: p.brochureUrl,
      loanType: p.loanType,
      status: p.status,
      serviceableStates: p.serviceableStates,
      rateType: p.rateType,
      rateMin: Number(p.rateMin),
      rateMax: Number(p.rateMax),
      minAmount: Number(p.minAmount),
      maxAmount: Number(p.maxAmount),
      minTenureMonths: p.minTenureMonths,
      maxTenureMonths: p.maxTenureMonths,
      minMonthlyIncome: Number(p.minMonthlyIncome),
      maxMonthlyIncome: p.maxMonthlyIncome ? Number(p.maxMonthlyIncome) : null,
      minAge: p.minAge,
      maxAge: p.maxAge,
      acceptedEmployment: p.acceptedEmployment,
      minEmploymentYears: p.minEmploymentYears,
      minCibilScore: p.minCibilScore,
      processingFeePercent: Number(p.processingFeePercent),
      commissionPercent: Number(p.commissionPercent),
      commissionPayoutDays: p.commissionPayoutDays,
      commissionNotes: p.commissionNotes,
      requiredDocuments: p.requiredDocuments,
      ltvPercent: p.ltvPercent ? Number(p.ltvPercent) : null,
      propertyTypes: p.propertyTypes,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private mapWithSlabs(p: any): LoanProductWithSlabs {
    return {
      ...this.map(p),
      rateSlabs: (p.rateSlabs ?? []).map((s: any) => ({
        id: s.id,
        productId: s.productId,
        minAmount: Number(s.minAmount),
        maxAmount: Number(s.maxAmount),
        ratePercent: Number(s.ratePercent),
        label: s.label,
      })),
    };
  }
}
