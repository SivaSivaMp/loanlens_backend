import { z } from "zod";

//Bank Profile

export const UpdateBankProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    contactPhone: z.string().min(10).max(15).optional(),
    websiteUrl: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
    gstin: z.string().length(15).optional(),
    licenceNumber: z.string().optional(),
  }),
});

export type UpdateBankProfileDto = z.infer<
  typeof UpdateBankProfileSchema
>["body"];

//Rate slab
const RateSlabSchema = z.object({
  minAmount: z.number().min(0),
  maxAmount: z.number().min(1),
  ratePercent: z.number().min(0.1).max(50),
  label: z.string().optional(),
});

//create product
export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name required"),
    description: z.string().optional(),
    loanType: z.enum(["HOME", "PERSONAL", "CAR", "BUSINESS", "GOLD", "LAP"]),
    serviceableStates: z
      .array(z.string())
      .min(1, "At least one state required"),
    rateType: z.enum(["FIXED", "FLOATING", "BOTH"]),
    rateMin: z.number().min(0.1).max(50),
    rateMax: z.number().min(0.1).max(50),
    rateSlabs: z.array(RateSlabSchema).optional().default([]),
    minAmount: z.number().min(1),
    maxAmount: z.number().min(1),
    minTenureMonths: z.number().min(1),
    maxTenureMonths: z.number().min(1),
    minMonthlyIncome: z.number().min(0),
    maxMonthlyIncome: z.number().optional(),
    minAge: z.number().min(18).max(80),
    maxAge: z.number().min(18).max(80),
    acceptedEmployment: z
      .array(z.enum(["SALARIED", "SELF_EMPLOYED", "BOTH"]))
      .min(1),
    minEmploymentYears: z.number().min(0),
    minCibilScore: z.number().min(300).max(900),
    processingFeePercent: z.number().min(0).max(10).default(0),
    commissionPercent: z.number().min(0).max(5),
    commissionPayoutDays: z.number().min(0).default(30),
    commissionNotes: z.string().optional(),
    requiredDocuments: z.array(z.string()).default([]),
    ltvPercent: z.number().min(0).max(100).optional(),
    propertyTypes: z.array(z.string()).optional().default([]),
  }),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>["body"];

//update product
export const UpdateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    serviceableStates: z.array(z.string()).min(1).optional(),
    rateType: z.enum(["FIXED", "FLOATING", "BOTH"]).optional(),
    rateMin: z.number().min(0.1).max(50).optional(),
    rateMax: z.number().min(0.1).max(50).optional(),
    rateSlabs: z.array(RateSlabSchema).optional(),
    minAmount: z.number().min(1).optional(),
    maxAmount: z.number().min(1).optional(),
    minTenureMonths: z.number().min(1).optional(),
    maxTenureMonths: z.number().min(1).optional(),
    minMonthlyIncome: z.number().min(0).optional(),
    maxMonthlyIncome: z.number().optional(),
    minAge: z.number().min(18).max(80).optional(),
    maxAge: z.number().min(18).max(80).optional(),
    acceptedEmployment: z
      .array(z.enum(["SALARIED", "SELF_EMPLOYED", "BOTH"]))
      .optional(),
    minEmploymentYears: z.number().min(0).optional(),
    minCibilScore: z.number().min(300).max(900).optional(),
    processingFeePercent: z.number().min(0).max(10).optional(),
    commissionPercent: z.number().min(0).max(5).optional(),
    commissionPayoutDays: z.number().min(0).optional(),
    commissionNotes: z.string().optional(),
    requiredDocuments: z.array(z.string()).optional(),
    ltvPercent: z.number().min(0).max(100).optional(),
    propertyTypes: z.array(z.string()).optional(),
    brochureUrl: z.string().url().optional(),
    rateChangeNotes: z.string().optional(), // if rate changes, admin can add a note
  }),
});

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>["body"];

//Update Product Status
export const UpdateProductStatusSchema = z.object({
  body: z.object({
    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  }),
});

export type UpdateProductStatusDto = z.infer<
  typeof UpdateProductStatusSchema
>["body"];

//Product List Query

export const ProductListQuerySchema = z.object({
  query: z.object({
    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(),
    loanType: z
      .enum(["HOME", "PERSONAL", "CAR", "BUSINESS", "GOLD", "LAP"])
      .optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export type ProductListQueryDto = z.infer<
  typeof ProductListQuerySchema
>["query"];
