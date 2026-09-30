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
} from "../entities/LoanProduct";

export interface ProductFilters {
  status?: ProductStatus;
  loanType?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedProducts {
  data: LoanProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRateHistoryData {
  productId: string;
  oldRateMin: number;
  oldRateMax: number;
  newRateMin: number;
  newRateMax: number;
  changedById: string;
  notes?: string;
}

export interface ILoanProductRepository {
  // CRUD
  create(
    data: CreateProductData,
    slabs: CreateSlabData[],
  ): Promise<LoanProductWithSlabs>;
  findById(id: string): Promise<LoanProductWithSlabs | null>;
  findAllByBankId(
    bankId: string,
    filters: ProductFilters,
  ): Promise<PaginatedProducts>;
  update(
    id: string,
    data: UpdateProductData,
    slabs?: CreateSlabData[],
  ): Promise<LoanProduct>;
  updateStatus(id: string, status: ProductStatus): Promise<void>;
  deleteProductsByBankId(bankId: string): Promise<void>;

  // Rate history
  createRateHistory(data: CreateRateHistoryData): Promise<void>;
  getRateHistory(productId: string): Promise<ProductRateHistory[]>;

  // Analytics
  getAnalyticsOverview(bankId: string): Promise<BankAnalyticsOverview>;
  getProductAnalytics(bankId: string): Promise<ProductAnalyticRow[]>;
}
