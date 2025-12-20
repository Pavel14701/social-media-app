import { Model } from 'mongoose';

export abstract class BaseRepository<TDomain, TRaw> {
  constructor(protected readonly model: Model<TRaw>) {}

  async findAll(): Promise<TDomain[]> {
    const docs = await this.model.find().exec();
    return docs.map((d) => this.toDomain(d));
  }

  async findById(id: string): Promise<TDomain | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(id: string, entity: Partial<TDomain>): Promise<TDomain | null> {
    const update = this.toPersistence(entity);
    const doc = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  protected abstract toDomain(doc: TRaw): TDomain;
  protected abstract toPersistence(entity: Partial<TDomain>): Partial<TRaw>;
}
