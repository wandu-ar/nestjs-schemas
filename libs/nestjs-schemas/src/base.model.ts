import {
  FilterQuery,
  Model,
  QueryOptions,
  Document,
  startSession,
  Aggregate,
  PipelineStage,
} from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { DatabaseHelper } from './helpers';
import { ObjectId } from './types';

export type ToObjectOption = {
  toObject?: boolean;
};

export enum SoftDeleteEnum {
  ONLY_NOT_DELETED = 'ONLY_NOT_DELETED',
  ONLY_DELETED = 'ONLY_DELETED',
  ALL = 'ALL',
}

export type SoftDeleteOption = {
  softDelete?: SoftDeleteEnum;
};

export type AggregateOptions = SoftDeleteOption & {
  pipeline?: PipelineStage[];
};

export type FindAllOptions<T> = SoftDeleteOption &
  ToObjectOption &
  Pick<QueryOptions<T>, 'projection'> &
  Pick<QueryOptions<T>, 'skip'> &
  Pick<QueryOptions<T>, 'limit'> &
  Pick<QueryOptions<T>, 'sort'>;

export type FindOneOptions<T> = SoftDeleteOption &
  ToObjectOption &
  Pick<QueryOptions<T>, 'projection'> &
  Pick<QueryOptions<T>, 'skip'> &
  Pick<QueryOptions<T>, 'sort'>;

export type FindByIdOptions<T> = SoftDeleteOption &
  ToObjectOption &
  Pick<QueryOptions<T>, 'projection'>;

export type ExistsOption = SoftDeleteOption;

export type CountOptions = SoftDeleteOption;

export type InsertOptions = ToObjectOption;
export type InsertManyOptions = ToObjectOption;

export type UpdateManyOptions = SoftDeleteOption;
export type UpdateOneOptions = SoftDeleteOption;
export type UpdateOptions = ToObjectOption & SoftDeleteOption;

export type ImplementSoftDelete = {
  implementSoftDelete?: boolean;
};

export type DeleteManyOptions = ImplementSoftDelete;
export type DeleteOneOptions = ImplementSoftDelete;
export type DeleteOptions = ImplementSoftDelete;

export interface DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}

/**
 * Servicio de modelo base.
 * Esta clase implementa soft delete strategy.
 *
 * @see https://github.com/dsanel/mongoose-delete#method-overridden
 * @author Alejandro D. Guevara
 */
export abstract class BaseModel<TDocument extends Document> {
  protected _implementSoftDelete: boolean;

  constructor(protected readonly _model: Model<TDocument>) {
    this._implementSoftDelete = typeof (<any>(<unknown>_model)).delete !== 'undefined';
  }

  /**
   * Return true if soft delete is enabled for this module
   */
  isSoftDeleteEnabled() {
    return this._implementSoftDelete;
  }

  /**
   * List documents
   */
  async aggregate(options?: AggregateOptions) {
    return await this._aggregate({ ...options, returnCount: false });
  }

  /**
   * Count aggregate documents
   */
  async aggregateAndCount(options?: AggregateOptions) {
    return await this._aggregate({ ...options, returnCount: true });
  }

  async _aggregate(options?: AggregateOptions & { returnCount: true }): Promise<number>;
  async _aggregate(options?: AggregateOptions & { returnCount: false }): Promise<TDocument[]>;
  async _aggregate(options?: AggregateOptions & { returnCount: unknown }): Promise<unknown> {
    try {
      let query: Aggregate<any>;
      if (!this._implementSoftDelete) {
        const model = <Model<TDocument>>(<unknown>this._model);
        query = model.aggregate<TDocument>();
      } else {
        const model = <SoftDeleteModel<SoftDeleteDocument>>(<unknown>this._model);
        if (options?.softDelete === SoftDeleteEnum.ALL) {
          // list all documents - deleted and not deleted
          query = model.aggregateWithDeleted<TDocument>();
        } else if (options?.softDelete === SoftDeleteEnum.ONLY_DELETED) {
          // list only deleted documents
          query = model.aggregateDeleted<TDocument>();
        } else {
          // default - list only not deleted documents
          query = model.aggregate<TDocument>();
        }
      }
      if (options?.pipeline !== undefined) query.append(<any>(<unknown>options.pipeline));

      if (options?.returnCount) {
        query.count('total');
      }
      const result = await query.exec();
      if (options?.returnCount) {
        return result && result.length ? (result[0].total as number) : 0;
      } else {
        return result as TDocument[];
      }
    } catch (err) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Find many documents
   */
  async findAll(filter: FilterQuery<TDocument> = {}, options?: FindAllOptions<TDocument>) {
    try {
      const newOpts = { ...options };
      delete newOpts.projection;
      delete newOpts.toObject;
      delete newOpts.softDelete;

      let query;
      if (!this._implementSoftDelete) {
        const model = <Model<TDocument>>(<unknown>this._model);
        query = model.find(filter, options?.projection ?? null, newOpts);
      } else {
        const model = <SoftDeleteModel<SoftDeleteDocument>>(<unknown>this._model);
        if (options?.softDelete === SoftDeleteEnum.ALL) {
          // find all documents - deleted and not deleted
          query = model.findWithDeleted(filter, options.projection ?? null, newOpts);
        } else if (options?.softDelete === SoftDeleteEnum.ONLY_DELETED) {
          // find only deleted documents
          query = model.findDeleted(filter, options.projection ?? null, newOpts);
        } else {
          // default - find only not deleted documents
          query = model.find(filter, options?.projection ?? null, newOpts);
        }
      }

      const result = !options?.toObject ? await query.exec() : await query.lean().exec();

      return result;
    } catch (err) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Find a single document
   */
  async findOne(filter: FilterQuery<TDocument> = {}, options?: FindOneOptions<TDocument>) {
    const result = await this.findAll(filter, { ...options, limit: 1 });
    return result && Array.isArray(result) && result.length >= 1 ? result.shift() || null : null;
  }

  /**
   * Find a single document by id
   */
  async findById(id: ObjectId, options?: FindByIdOptions<TDocument>) {
    return await this.findOne({ _id: id }, options);
  }

  /**
   * Verify than at least one document exists
   */
  async exists(filter: FilterQuery<TDocument>, options?: ExistsOption) {
    try {
      const result = await this.findOne(filter, {
        ...options,
        projection: { _id: 1 },
        toObject: true,
      });
      return result !== null;
    } catch (err) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Verify than id document exist
   */
  async existsId(id: ObjectId, options?: ExistsOption) {
    return await this.exists({ _id: id }, options);
  }

  /**
   * Count documents
   */
  async count(filter: FilterQuery<TDocument> = {}, options?: CountOptions) {
    try {
      if (!this._implementSoftDelete) {
        return await this._model.countDocuments(filter).exec();
      }

      const model = <SoftDeleteModel<SoftDeleteDocument>>(<unknown>this._model);

      if (options?.softDelete === SoftDeleteEnum.ALL) {
        // count all documents - deleted and not deleted
        return await model.countDocumentsWithDeleted(filter).exec();
      } else if (options?.softDelete === SoftDeleteEnum.ONLY_DELETED) {
        // count only deleted documents
        return await model.countDocumentsDeleted(filter).exec();
      }

      // default - count only not deleted documents
      return await model.countDocuments(filter).exec();
    } catch (err) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Insert and return the id of new document
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async insert(data: Partial<TDocument>, options?: InsertOptions) {
    try {
      const model = <Model<TDocument>>(<unknown>this._model);
      const result = await model.create(data);
      return result;
    } catch (err: any) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Insert and return many new documents
   */
  async insertMany(data: Partial<TDocument>[]) {
    try {
      const model = <Model<TDocument>>(<unknown>this._model);
      const result = await model.insertMany(data, { rawResult: true });
      return result;
    } catch (err: any) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Update many document and return update result stats
   */
  async updateMany(
    filter: FilterQuery<TDocument>,
    data: Partial<TDocument>,
    options?: UpdateManyOptions,
  ) {
    try {
      if (!this._implementSoftDelete) {
        return await this._model.updateMany(filter, data).exec();
      }

      const model = <SoftDeleteModel<SoftDeleteDocument>>(<unknown>this._model);

      if (options?.softDelete === SoftDeleteEnum.ALL) {
        // update all documents - deleted and not deleted
        return await model.updateManyWithDeleted(filter, data).exec();
      } else if (options?.softDelete === SoftDeleteEnum.ONLY_DELETED) {
        // update only deleted documents
        return await model.updateManyDeleted(filter, data).exec();
      }

      // default - update only not deleted documents
      return await model.updateMany(filter, data).exec();
    } catch (err: any) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Update a single document and return update result stat
   */
  async updateOne(
    filter: FilterQuery<TDocument>,
    data: Partial<TDocument>,
    options?: UpdateOneOptions,
  ) {
    try {
      if (!this._implementSoftDelete) {
        return await this._model.updateOne(filter, data).exec();
      }

      const model = <SoftDeleteModel<SoftDeleteDocument>>(<unknown>this._model);

      if (options?.softDelete === SoftDeleteEnum.ALL) {
        // update document - deleted and not deleted
        return await model.updateOneWithDeleted(filter, data).exec();
      } else if (options?.softDelete === SoftDeleteEnum.ONLY_DELETED) {
        // update only deleted document
        return await model.updateOneDeleted(filter, data).exec();
      }

      // default - update only not deleted document
      return await model.updateOne(filter, data).exec();
    } catch (err: any) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Update and return a single document by id
   */
  async update(id: ObjectId, data: Partial<TDocument>, options?: UpdateOptions) {
    try {
      const opts = { new: true, runValidators: true };
      if (!this._implementSoftDelete) {
        const model = <Model<TDocument>>(<unknown>this._model);
        return !options?.toObject
          ? await model.findByIdAndUpdate(id, data, opts).exec()
          : await model.findByIdAndUpdate(id, data, opts).lean().exec();
      }

      const model = <SoftDeleteModel<SoftDeleteDocument>>(<unknown>this._model);

      if (options?.softDelete === SoftDeleteEnum.ALL) {
        // update document - deleted and not deleted
        return !options?.toObject
          ? await model.findOneAndUpdateWithDeleted({ _id: id }, data, opts).exec()
          : await model.findOneAndUpdateWithDeleted({ _id: id }, data, opts).lean().exec();
      } else if (options?.softDelete === SoftDeleteEnum.ONLY_DELETED) {
        // update only deleted document
        return !options?.toObject
          ? await model.findOneAndUpdateDeleted({ _id: id }, data, opts).exec()
          : await model.findOneAndUpdateDeleted({ _id: id }, data, opts).lean().exec();
      }

      // default - update only not deleted document
      return !options?.toObject
        ? await model.findOneAndUpdate({ _id: id }, data, opts).exec()
        : await model.findOneAndUpdate({ _id: id }, data, opts).lean().exec();
    } catch (err: any) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Delete many document and return delete result stats
   */
  async deleteMany(filter: FilterQuery<TDocument>, options?: DeleteManyOptions) {
    try {
      if (!this._implementSoftDelete) {
        // hard delete
        return await this._model.deleteMany(filter).exec();
      }

      const model = <SoftDeleteModel<SoftDeleteDocument>>(<unknown>this._model);

      if (options?.implementSoftDelete === false) {
        // hard delete
        return await model.deleteMany(filter).exec();
      }

      // otherwise, soft delete
      return await model.delete({ ...filter, deleted: { $eq: false } }).exec();
    } catch (err: any) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Delete a single document and return delete result stat
   */
  async deleteOne(filter: FilterQuery<TDocument>, options?: DeleteOneOptions) {
    try {
      if (!this._implementSoftDelete) {
        // hard delete
        return await this._model.deleteOne(filter).exec();
      }

      const model = <SoftDeleteModel<SoftDeleteDocument>>(<unknown>this._model);

      if (options?.implementSoftDelete === false) {
        // hard delete
        return await model.deleteOne(filter).exec();
      }

      // otherwise, implement soft delete
      return await model.delete({ ...filter, deleted: { $eq: false } }).exec();
    } catch (err: any) {
      throw DatabaseHelper.dispatchError(err);
    }
  }

  /**
   * Delete and return a single document by id
   */
  async delete(id: ObjectId, options?: DeleteOptions) {
    return await this.deleteOne({ _id: id }, options);
  }

  /**
   * Excecute operations inside a transaction
   */
  async withTransaction<T = void>(fn: () => Promise<T>) {
    const session = await startSession();
    try {
      await session.withTransaction(fn);
    } catch (err) {
      throw err;
    } finally {
      await session.endSession();
    }
  }

  get model() {
    return this._model;
  }
}
