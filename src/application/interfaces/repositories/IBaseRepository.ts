export interface IBaseRepository<TModel, TCreateInput, TUpdateInput> {
  findById(id: string): Promise<TModel | null>;
  findFirst(where: object, include?: object): Promise<TModel | null>;
  findMany(conditions: object): Promise<TModel[]>;
  create(data: TCreateInput): Promise<TModel>;
  update(id: string, data: TUpdateInput): Promise<TModel>;
}
