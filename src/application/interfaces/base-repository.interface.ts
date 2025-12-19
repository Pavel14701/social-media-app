export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
}
