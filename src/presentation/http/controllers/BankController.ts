import { Request, Response } from "express";
import {
  DeactivateBankUseCase,
  GetBankProfileUseCase,
  UpdateBankProfileUseCase,
} from "@/application/use-cases/bank/BankProfileUseCases";
import { GetBankAnalyticsUseCase } from "@/application/use-cases/bank/ProductUseCases";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/response";
import { UpdateBankProfileDto } from "@/application/dtos/bank/bank.dto";

export class BankController {
  constructor(
    private readonly getBankProfile: GetBankProfileUseCase,
    private readonly updateBankProfile: UpdateBankProfileUseCase,
    private readonly deactivateBank: DeactivateBankUseCase,
    private readonly getBankAnalytics: GetBankAnalyticsUseCase,
  ) {}

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const bank = await this.getBankProfile.execute(req.user!.userId);
    return successResponse(res, bank);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as UpdateBankProfileDto;
    const bank = await this.updateBankProfile.execute(req.user!.userId, dto);
    return successResponse(res, bank, "Bank profile updated.");
  });

  deactivate = asyncHandler(async (req: Request, res: Response) => {
    await this.deactivateBank.execute(req.user!.userId);
    return successResponse(
      res,
      null,
      "Bank deactivated. All products are now hidden from search.",
    );
  });

  getAnalyticsOverview = asyncHandler(async (req: Request, res: Response) => {
    const { overview } = await this.getBankAnalytics.execute(req.user!.userId);
    return successResponse(res, overview);
  });

  getProductAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { products } = await this.getBankAnalytics.execute(req.user!.userId);
    return successResponse(res, products);
  });
}
