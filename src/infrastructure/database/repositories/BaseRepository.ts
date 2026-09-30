import { PrismaClient } from "@prisma/client";
import { IBaseRepository } from "@/application/interfaces/repositories/IBaseRepository";

/**
 * Abstract Prisma implementation of IBaseRepository.
 *
 * Concrete repositories call super(prisma, prisma.<modelDelegate>) in their
 * constructor and get findById, findFirst, findMany, create, update for FREE.
 * They only need to write their own domain-specific methods.
 *
 * Example:
 *   export class PrismaBankRepository
 *     extends BaseRepository<Bank, never, UpdateBankData>
 *     implements IBankRepository
 *   {
 *     constructor(prisma: PrismaClient) {
 *       super(prisma, prisma.bank);  // ← passes the Prisma model delegate
 *     }
 *     // findById, update, etc. are inherited — only write domain-specific methods
 *   }
 */
export abstract class BaseRepository<TModel, TCreateInput, TUpdateInput>
  implements IBaseRepository<TModel, TCreateInput, TUpdateInput>
{
  constructor(
    protected readonly prisma: PrismaClient,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly model: any, // Prisma model delegate e.g. prisma.bank
  ) {}

  async findById(id: string): Promise<TModel | null> {
    return this.model.findUnique({ where: { id } }) as Promise<TModel | null>;
  }

  async findFirst(where: object, include?: object): Promise<TModel | null> {
    return this.model.findFirst({
      where,
      ...(include ? { include } : {}),
    }) as Promise<TModel | null>;
  }

  async findMany(conditions: object): Promise<TModel[]> {
    return this.model.findMany({ ...conditions }) as Promise<TModel[]>;
  }

  async create(data: TCreateInput): Promise<TModel> {
    return this.model.create({ data }) as Promise<TModel>;
  }

  async update(id: string, data: TUpdateInput): Promise<TModel> {
    return this.model.update({ where: { id }, data }) as Promise<TModel>;
  }
}
