import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/response";
import {
  DeactivateAgentUseCase,
  GetAgentDetailUseCase,
  GetCompanyProfileUseCase,
  ListAgentsUseCase,
  ReactivateAgentUseCase,
  UpdateCompanyProfileUseCase,
} from "@/application/use-cases/dsa/CompanyUseCases";
import {
  AgentListQueryDto,
  UpdateAgentProfileDto,
  UpdateCompanyProfileDto,
} from "@/application/dtos/dsa/dsa.dto";

export class DSAController {
  constructor(
    private readonly getCompanyProfile: GetCompanyProfileUseCase,
    private readonly updateCompanyProfile: UpdateCompanyProfileUseCase,
    private readonly listAgents: ListAgentsUseCase,
    private readonly getAgentDetail: GetAgentDetailUseCase,
    private readonly deactivateAgent: DeactivateAgentUseCase,
    private readonly reactivateAgent: ReactivateAgentUseCase,
  ) {}
  //get profile
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.getCompanyProfile.execute(req.user!.userId);
    return successResponse(res, data);
  });
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as UpdateCompanyProfileDto;
    const data = await this.updateCompanyProfile.execute(req.user!.userId, dto);
    return successResponse(res, data, "Company profile updated.");
  });
  //agent management
  listAgentsHandler = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AgentListQueryDto;
    const result = await this.listAgents.execute(req.user!.userId, query);
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
  //get agent detail handler

  getAgentDetailHandler = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.getAgentDetail.execute(
      req.user!.userId,
      req.params.agentId as string,
    );
    return successResponse(res, data);
  });

  //de-activate agent handler
  deactivateAgentHandler = asyncHandler(async (req: Request, res: Response) => {
    const { agentName } = await this.deactivateAgent.execute(
      req.user!.userId,
      req.params.agentId as string,
    );
    return successResponse(
      res,
      null,
      `Agent ${agentName} has been deactivated.`,
    );
  });

  //re-activate agent handler
  reactivateAgentHandler = asyncHandler(async (req: Request, res: Response) => {
    const { agentName } = await this.reactivateAgent.execute(
      req.user!.userId,
      req.params.agentId as string,
    );
    return successResponse(
      res,
      null,
      `Agent ${agentName} has been reactivated.`,
    );
  });
}
