import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse } from '../utils/response'
import {
  ListLeadsUseCase,
  GetLeadDetailUseCase,
  AssignLeadUseCase,
  UpdateLeadStatusUseCase,
  UpdateLeadNotesUseCase,
  CreateLeadUseCase,
} from '@/application/use-cases/dsa/LeadUseCases'
import type { LeadFilters, LeadStatus } from '@/domain/entities/Lead'

export class LeadController {
  constructor(
    private readonly listLeads: ListLeadsUseCase,
    private readonly getLeadDetail: GetLeadDetailUseCase,
    private readonly assignLead: AssignLeadUseCase,
    private readonly updateLeadStatus: UpdateLeadStatusUseCase,
    private readonly updateLeadNotes: UpdateLeadNotesUseCase,
    private readonly createLead: CreateLeadUseCase,
  ) {}

  listLeadsHandler = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as LeadFilters
    const result = await this.listLeads.execute(req.user!.userId, query)
    return res.json({
      success: true,
      data: result.data,
      pagination: {
        page:       result.page,
        limit:      result.limit,
        total:      result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    })
  })

  getLeadDetailHandler = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.getLeadDetail.execute(
      req.user!.userId,
      req.params['leadId'] as string,
    )
    return successResponse(res, data)
  })

  assignLeadHandler = asyncHandler(async (req: Request, res: Response) => {
    const { fieldAgentId } = req.body as { fieldAgentId: string }
    const data = await this.assignLead.execute(
      req.user!.userId,
      req.params['leadId'] as string,
      fieldAgentId,
    )
    return successResponse(res, data, 'Lead assigned successfully.')
  })

  updateLeadStatusHandler = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as { status: LeadStatus }
    const data = await this.updateLeadStatus.execute(
      req.user!.userId,
      req.params['leadId'] as string,
      status,
    )
    return successResponse(res, data, 'Lead status updated.')
  })

  updateLeadNotesHandler = asyncHandler(async (req: Request, res: Response) => {
    const { internalNotes } = req.body as { internalNotes: string }
    const data = await this.updateLeadNotes.execute(
      req.params['leadId'] as string,
      internalNotes,
    )
    return successResponse(res, data, 'Notes saved.')
  })

  createLeadHandler = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.createLead.execute(req.user!.userId, req.body)
    return successResponse(res, data, 'Lead created.', 201)
  })
}
