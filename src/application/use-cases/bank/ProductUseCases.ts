import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/infrastructure/di/tokens";
import {
  CreateProductDto,
  ProductListQueryDto,
  UpdateProductDto,
  UpdateProductStatusDto,
} from "@/application/dtos/bank/bank.dto";
import { INotificationQueue } from "@/application/interfaces/INotificationQueue";
import { LoanProductDomain } from "@/domain/entities/LoanProduct";
import {
  BankNotFoundError,
  InvalidStatusTransitionError,
  ProductNotFoundError,
  ProductOwnershipError,
} from "@/domain/errors/errors";
import { IBankRepository } from "@/domain/repositories/IBankRepository";
import { ILoanProductRepository } from "@/domain/repositories/ILoanProductRepository";

@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
    @inject(TOKENS.ILoanProductRepository) private readonly productRepo: ILoanProductRepository,
  ) {}

  async execute(userId: string, dto: CreateProductDto) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();

    const { rateSlabs = [], ...productData } = dto;

    const product = await this.productRepo.create(
      { ...productData, bankId: bank.id },
      rateSlabs,
    );
    return product;
  }
}

//  List Products

@injectable()
export class GetProductsUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
    @inject(TOKENS.ILoanProductRepository) private readonly productRepo: ILoanProductRepository,
  ) {}

  async execute(userId: string, query: ProductListQueryDto) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();

    return this.productRepo.findAllByBankId(bank.id, {
      status: query.status,
      loanType: query.loanType,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }
}

//  Get Product Detail

@injectable()
export class GetProductDetailUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
    @inject(TOKENS.ILoanProductRepository) private readonly productRepo: ILoanProductRepository,
  ) {}

  async execute(userId: string, productId: string) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();

    const product = await this.productRepo.findById(productId);
    if (!product) throw new ProductNotFoundError();
    if (!new LoanProductDomain(product).isOwnedBy(bank.id)) throw new ProductOwnershipError();

    return product;
  }
}

//  Update Product

//  Update Product Status

@injectable()
export class UpdateProductStatusUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
    @inject(TOKENS.ILoanProductRepository) private readonly productRepo: ILoanProductRepository,
  ) {}

  async execute(
    userId: string,
    productId: string,
    dto: UpdateProductStatusDto,
  ) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();

    const product = await this.productRepo.findById(productId);
    if (!product) throw new ProductNotFoundError();

    const productDomain = new LoanProductDomain(product);
    if (!productDomain.isOwnedBy(bank.id)) throw new ProductOwnershipError();
    if (!productDomain.canTransitionTo(dto.status)) {
      throw new InvalidStatusTransitionError(product.status, dto.status);
    }

    await this.productRepo.updateStatus(productId, dto.status);
    return { id: productId, status: dto.status };
  }
}

//  Get Rate History

@injectable()
export class GetRateHistoryUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
    @inject(TOKENS.ILoanProductRepository) private readonly productRepo: ILoanProductRepository,
  ) {}

  async execute(userId: string, productId: string) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();

    const product = await this.productRepo.findById(productId);
    if (!product) throw new ProductNotFoundError();
    if (!new LoanProductDomain(product).isOwnedBy(bank.id)) throw new ProductOwnershipError();

    return this.productRepo.getRateHistory(productId);
  }
}

//  Bank Analytics

@injectable()
export class GetBankAnalyticsUseCase {
  constructor(
    @inject(TOKENS.IBankRepository) private readonly bankRepo: IBankRepository,
    @inject(TOKENS.ILoanProductRepository) private readonly productRepo: ILoanProductRepository,
  ) {}

  async execute(userId: string) {
    const bank = await this.bankRepo.findByUserId(userId);
    if (!bank) throw new BankNotFoundError();

    const [overview, products] = await Promise.all([
      this.productRepo.getAnalyticsOverview(bank.id),
      this.productRepo.getProductAnalytics(bank.id),
    ]);

    return { overview, products };
  }
}
