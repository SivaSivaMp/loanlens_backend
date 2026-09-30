import { Request, Response } from "express";
import {
  CreateAgreementUseCase,
  CreateSplitRuleUseCase,
  DeleteSplitRuleUseCase,
  ListAgreementsUseCase,
  ListBanksUseCase,
  ListSplitRulesUseCase,
  ToggleAgreementUseCase,
  UpdateSplitRuleUseCase,
} from "@/application/use-cases/dsa/AgreementUseCases";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/response";
import {
  BankListQueryDto,
  CreateAgreementDto,
  CreateSplitRuleDto,
  ToggleAgreementDto,
  UpdateSplitRuleDto,
} from "@/application/dtos/dsa/dsa.dto";

export class AgreementController {
  constructor(
    private readonly listBanks: ListBanksUseCase,
    private readonly listAgreements: ListAgreementsUseCase,
    private readonly createAgreement: CreateAgreementUseCase,
    private readonly toggleAgreement: ToggleAgreementUseCase,
    private readonly listSplitRules: ListSplitRulesUseCase,
    private readonly createSplitRule: CreateSplitRuleUseCase,
    private readonly updateSplitRule: UpdateSplitRuleUseCase,
    private readonly deleteSplitRule: DeleteSplitRuleUseCase,
  ) {}

  //Banks
  listBanksHandler = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as BankListQueryDto;
    const result = await this.listBanks.execute(req.user!.userId, query);
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

  //Agreement

  listAgreementsHandler = asyncHandler(async (req: Request, res: Response) => {
    const isActive =
      req.query["isActive"] === "true"
        ? true
        : req.query["isActive"] === "false"
          ? false
          : undefined;
    const data = await this.listAgreements.execute(req.user!.userId, isActive);
    return successResponse(res, data);
  });

  createAgreementHandler = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as CreateAgreementDto;
    const data = await this.createAgreement.execute(
      req.user!.userId,
      req.params.bankId as string,
      dto,
    );
    return successResponse(res, data, undefined, 201);
  });

  toggleAgreementHandler = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as ToggleAgreementDto;
    const data = await this.toggleAgreement.execute(
      req.user!.userId,
      req.params.bankId as string,
      dto,
    );
    const msg = data.isActive
      ? "Agreement activated."
      : "Agreement deactivated.";
    return successResponse(res, { isActive: data.isActive }, msg);
  });

  //Split rule
  listSplitRulesHandler = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.listSplitRules.execute(req.user!.userId);
    return successResponse(res, data);
  });

  createSplitRuleHandler = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as CreateSplitRuleDto;
    const data = await this.createSplitRule.execute(req.user!.userId, dto);
    return successResponse(res, data, undefined, 201);
  });

  updateSplitRuleHandler = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as UpdateSplitRuleDto;
    const data = await this.updateSplitRule.execute(
      req.user!.userId,
      req.params.ruleId as string,
      dto,
    );
    return successResponse(res, data);
  });
  deleteSplitRuleHandler = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteSplitRule.execute(
      req.user!.userId,
      req.params.ruleId as string,
    );
    return successResponse(res, null, "Split rule removed.");
  });
}
