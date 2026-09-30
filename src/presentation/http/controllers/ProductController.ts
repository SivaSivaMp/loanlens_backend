import { Request, Response } from "express";
import {
  CreateProductUseCase,
  GetProductDetailUseCase,
  GetProductsUseCase,
  GetRateHistoryUseCase,
  UpdateProductStatusUseCase,
} from "@/application/use-cases/bank/ProductUseCases";
import { asyncHandler } from "../utils/asyncHandler";
import {
  CreateProductDto,
  ProductListQueryDto,
  UpdateProductDto,
  UpdateProductStatusDto,
} from "@/application/dtos/bank/bank.dto";
import { successResponse } from "../utils/response";

export class ProductController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly getProducts: GetProductsUseCase,
    private readonly getProductDetail: GetProductDetailUseCase,

    private readonly updateProductStatus: UpdateProductStatusUseCase,
    private readonly getRateHistory: GetRateHistoryUseCase,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as CreateProductDto;
    const product = await this.createProduct.execute(req.user!.userId, dto);
    return successResponse(
      res,
      product,
      "Product created in draft. Set status to ACTIVE when ready.",
      201,
    );
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ProductListQueryDto;
    const result = await this.getProducts.execute(req.user!.userId, query);
    return res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.getProductDetail.execute(
      req.user!.userId,
      req.params.id as string,
    );
    return successResponse(res, product);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as UpdateProductStatusDto;
    const result = await this.updateProductStatus.execute(
      req.user!.userId,
      req.params.id as string,
      dto,
    );
    const message =
      dto.status === "ACTIVE"
        ? "Product is now active and visible in search."
        : `Product status updated to ${dto.status}.`;
    return successResponse(res, result, message);
  });

  rateHistory = asyncHandler(async (req: Request, res: Response) => {
    const history = await this.getRateHistory.execute(
      req.user!.userId,
      req.params.id as string,
    );
    return successResponse(res, history);
  });
}
