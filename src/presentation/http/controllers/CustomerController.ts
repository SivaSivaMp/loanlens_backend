// src/presentation/http/controllers/CustomerController.ts

import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse } from '../utils/response'
import { ListCustomersUseCase, ToggleCustomerStatusUseCase } from '@/application/use-cases/dsa/CustomerUseCases'

export class CustomerController {
  constructor(
    private readonly listCustomers: ListCustomersUseCase,
    private readonly toggleStatus: ToggleCustomerStatusUseCase,
  ) {}

  // GET /dsa/customers
  listCustomersHandler = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any
    const result = await this.listCustomers.execute(req.user!.userId, {
      search:   query.search   as string | undefined,
      isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      page:     Number(query.page)  || 1,
      limit:    Number(query.limit) || 20,
    })

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

  // PATCH /dsa/customers/:portalUserId/status  body: { isActive: boolean }
  toggleCustomerStatusHandler = asyncHandler(async (req: Request, res: Response) => {
    const portalUserId = req.params.portalUserId as string;
    const { isActive } = req.body as { isActive: boolean }

    const result = await this.toggleStatus.execute(req.user!.userId, portalUserId, isActive)

    const action = isActive ? 'reactivated' : 'deactivated'
    return successResponse(res, result, `Customer ${result.fullName} has been ${action}.`)
  })
}
