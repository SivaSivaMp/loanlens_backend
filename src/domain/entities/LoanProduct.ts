export type LoanType =
  | "HOME"
  | "PERSONAL"
  | "CAR"
  | "BUSINESS"
  | "GOLD"
  | "LAP";
export type EmploymentType = "SALARIED" | "SELF_EMPLOYED" | "BOTH";
export type RateType = "FIXED" | "FLOATING" | "BOTH";
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

// ─── Allowed status transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<
  ProductStatus,
  ProductStatus[]
> = {
  DRAFT: ["ACTIVE", "INACTIVE"],
  ACTIVE: ["INACTIVE"],
  INACTIVE: ["ACTIVE"],
};

export interface RateSlab {
  id: string;
  productId: string;
  minAmount: number;
  maxAmount: number;
  ratePercent: number;
  label: string | null;
}

export interface LoanProduct {
  id: string;
  bankId: string;
  name: string;
  description: string | null;
  brochureUrl: string | null;
  loanType: LoanType;
  status: ProductStatus;
  serviceableStates: string[];
  rateType: RateType;
  rateMin: number;
  rateMax: number;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  minMonthlyIncome: number;
  maxMonthlyIncome: number | null;
  minAge: number;
  maxAge: number;
  acceptedEmployment: EmploymentType[];
  minEmploymentYears: number;
  minCibilScore: number;
  processingFeePercent: number;
  commissionPercent: number;
  commissionPayoutDays: number;
  commissionNotes: string | null;
  requiredDocuments: string[];
  ltvPercent: number | null;
  propertyTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanProductWithSlabs extends LoanProduct {
  rateSlabs: RateSlab[];
}

export interface ProductRateHistory {
  id: string;
  productId: string;
  oldRateMin: number | null;
  oldRateMax: number | null;
  newRateMin: number;
  newRateMax: number;
  changedById: string;
  changedByEmail: string;
  notes: string | null;
  changedAt: Date;
}

// ─── Create / Update data shapes

export interface CreateSlabData {
  minAmount: number;
  maxAmount: number;
  ratePercent: number;
  label?: string;
}

export interface CreateProductData {
  bankId: string;
  name: string;
  description?: string;
  loanType: LoanType;
  serviceableStates: string[];
  rateType: RateType;
  rateMin: number;
  rateMax: number;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  minMonthlyIncome: number;
  maxMonthlyIncome?: number;
  minAge: number;
  maxAge: number;
  acceptedEmployment: EmploymentType[];
  minEmploymentYears: number;
  minCibilScore: number;
  processingFeePercent?: number;
  commissionPercent: number;
  commissionPayoutDays?: number;
  commissionNotes?: string;
  requiredDocuments: string[];
  ltvPercent?: number;
  propertyTypes?: string[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  serviceableStates?: string[];
  rateType?: RateType;
  rateMin?: number;
  rateMax?: number;
  minAmount?: number;
  maxAmount?: number;
  minTenureMonths?: number;
  maxTenureMonths?: number;
  minMonthlyIncome?: number;
  maxMonthlyIncome?: number;
  minAge?: number;
  maxAge?: number;
  acceptedEmployment?: EmploymentType[];
  minEmploymentYears?: number;
  minCibilScore?: number;
  processingFeePercent?: number;
  commissionPercent?: number;
  commissionPayoutDays?: number;
  commissionNotes?: string;
  requiredDocuments?: string[];
  ltvPercent?: number;
  propertyTypes?: string[];
  brochureUrl?: string;
}

// ─── Analytics

export interface ProductAnalyticRow {
  productId: string;
  productName: string;
  loanType: LoanType;
  status: ProductStatus;
  impressions: number;
  applications: number;
  disbursed: number;
}

export interface BankAnalyticsOverview {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  totalImpressionsLast30Days: number;
  totalApplications: number;
  totalDisbursed: number;
}

export class LoanProductDomain {
  constructor(private readonly props: LoanProduct) {}

  canTransitionTo(newStatus: ProductStatus): boolean {
    return (
      ALLOWED_STATUS_TRANSITIONS[this.props.status]?.includes(newStatus) ??
      false
    );
  }

  isOwnedBy(bankId: string): boolean {
    return this.props.bankId === bankId;
  }

  get id(): string {
    return this.props.id;
  }
  get status(): ProductStatus {
    return this.props.status;
  }
  get bankId(): string {
    return this.props.bankId;
  }
}
