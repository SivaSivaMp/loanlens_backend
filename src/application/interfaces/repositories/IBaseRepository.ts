/**
 * Generic contract for the 5 standard CRUD operations.
 *
 * All domain-specific repository interfaces extend this to inherit
 * the common method signatures, avoiding repetition.
 *
 * TModel       — domain entity returned by queries
 * TCreateInput — DTO/data needed to create a record
 * TUpdateInput — DTO/data for partial update
 */
export interface IBaseRepository<TModel, TCreateInput, TUpdateInput> {
  findById(id: string): Promise<TModel | null>;
  findFirst(where: object, include?: object): Promise<TModel | null>;
  findMany(conditions: object): Promise<TModel[]>;
  create(data: TCreateInput): Promise<TModel>;
  update(id: string, data: TUpdateInput): Promise<TModel>;
}
