/* eslint-disable @typescript-eslint/ban-types */
import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer';
import { FilterQuery, PipelineStage } from 'mongoose';
import { RuleSet, SchemaDef } from './types';
import { defaultTransformOptions, METADATA } from './constants';
import {
  BaseModel,
  InsertManyOptions,
  InsertOptions,
  FindAllOptions,
  UpdateManyOptions,
  UpdateOneOptions,
  UpdateOptions,
  DeleteOptions,
  DeleteOneOptions,
  DeleteManyOptions,
  ExistsOption,
  CountOptions,
  SoftDeleteOption,
} from './base.model';
import { MetadataService } from './metadata.service';
import { LookupOpts } from './decorators';
import { PaginatedResponseDto } from './schemas';
import { QueryBuilderParser } from './helpers/query-builder-parser';
import { BadRequestException } from '@nestjs/common';

export type FindAllDocumentsOpts<T> = Omit<FindAllOptions<T>, 'toObject' | 'projection'> & {
  filter?: FilterQuery<any>;
  returnAs?: ClassConstructor<T>;
  transformOptions?: ClassTransformOptions;
  useAggregate?: boolean;
  filterMiddleware?: (filter: FilterQuery<any>) => FilterQuery<any>;
  pipelineMiddleware?: (
    pipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[],
  ) => Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[];
};
export type FindOneDocumentOpts<T> = Omit<FindAllDocumentsOpts<T>, 'limit'>;
export type FindDocumentByIdOpts<T> = Omit<FindOneDocumentOpts<T>, 'filter'>;

export type CountComplexDocumentsOpts<T> = Omit<
  FindAllDocumentsOpts<T>,
  'limit' | 'sort' | 'transformOptions' | 'skip'
>;

export type ListAllDocumentsOpts<T> = {
  limit: PipelineStage.Limit['$limit'];
  offset: PipelineStage.Skip['$skip'];
  searchQuery?: string;
  filter?: RuleSet;
  sort?: PipelineStage.Sort['$sort'];
  returnAs?: ClassConstructor<T>;
  transformOptions?: ClassTransformOptions;
} & SoftDeleteOption &
  Pick<FindAllDocumentsOpts<T>, 'useAggregate' | 'filterMiddleware' | 'pipelineMiddleware'>;

export type SearchResults<V> = {
  total: number;
  filtered: number;
  showing: number;
  data: V[];
};

/**
 * Proveedor de funciones relacionadas al módulo.
 * Interfaz entre el controlador u otros servicios y el modelo del módulo.
 *
 * @author Alejandro D. Guevara
 */
export abstract class BaseService<
  TDocument,
  TKey extends string & keyof TDocument,
  TModel extends BaseModel<TDocument, TKey, TKeyType>,
  TReturnDto,
  TKeyType = TDocument[TKey],
> {
  defaultTransformOptions: ClassTransformOptions = defaultTransformOptions;

  protected _cacheProjections: Map<string, any> = new Map();

  protected _cachePipelines: Map<string, PipelineStage[]> = new Map();

  constructor(
    protected readonly _metadata: MetadataService,
    protected readonly _model: TModel,
    protected readonly _returnAs: ClassConstructor<TReturnDto>,
  ) {}

  /**
   * Return true if soft delete is enabled for this module
   */
  isSoftDeleteEnabled() {
    return this._model.isSoftDeleteEnabled();
  }

  cleanInputString(query = '') {
    let newString = String(query);
    try {
      // limpieza
      newString = newString
        .trim()
        .replace(/°/g, 'º')
        .replace(/[^\w\s+\-.,;:°ºª_"\/@<>=]/giu, '');
      if (!newString || typeof newString !== 'string') newString = '';
      // quitar espacios en blanco duplicados
      newString = newString.replace(/\s{2,}/g, ' ');
    } catch (err) {
      newString = '';
    }

    return newString;
  }

  validateSort(sort: any, schema: Function | string) {
    this._validateSort(sort, this._getFullProjection(schema));
  }

  protected _validateSort(input: any, projection: any) {
    const keys = Object.getOwnPropertyNames(input);
    const possibleKeys = Object.getOwnPropertyNames(projection);
    for (const key of keys) {
      if (!possibleKeys.includes(key) || (input[key] !== 1 && input[key] !== -1))
        throw new BadRequestException('SORT_VALIDATION_ERR');
    }
  }

  createFilter<V = TReturnDto>(
    options: Required<Pick<ListAllDocumentsOpts<V>, 'returnAs'>> &
      Pick<ListAllDocumentsOpts<V>, 'searchQuery' | 'filter'>,
  ): FilterQuery<any> {
    // regexp para validar y obtener términos de busqueda
    const regex = /"([^"]+)"|([^"\s]+)/g;
    let filter: FilterQuery<any> = {};
    const $and: FilterQuery<any>[] = [];
    const query = options.searchQuery ?? '';
    const hasFilter = options.filter && Object.getOwnPropertyNames(options.filter).length;
    const projection = this.__getProjection(options.returnAs, false, [], 'type');

    // Create filter by query builder
    if (hasFilter) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      filter = new QueryBuilderParser(options.filter!, projection).getFilter();
    }

    // Create filter by search query
    const input = this.cleanInputString(query);
    const matches = input.match(regex);

    const terms: string[] = [];
    if (matches !== null) {
      for (const match of matches) {
        terms.push(match.replace(/(^"|"$)/g, ''));
      }
    }

    for (const term of terms) {
      const $or: FilterQuery<any>[] = [];
      for (const path in projection) {
        if (projection[path] === 'String' || projection[path] === 'SchemaString') {
          const def: FilterQuery<any> = {};
          def[path] = { $regex: new RegExp('.*' + this._regexScape(term) + '.*', 'iu') };
          $or.push(def);
        }
      }
      if ($or.length) $and.push({ $or: $or });
    }

    if ($and.length) {
      if (hasFilter) {
        const op = filter['$and'] !== undefined ? '$and' : '$or';
        filter = { $and: [{ [op]: filter[op] }, { $and: $and }] };
      } else {
        filter = { $and };
      }
    }

    return filter;
  }

  protected _regexScape(input = '') {
    return input.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  async listAllDocuments<V = TReturnDto>(
    options: ListAllDocumentsOpts<V>,
  ): Promise<PaginatedResponseDto<V>> {
    const returnAs = <ClassConstructor<V>>(<unknown>options?.returnAs ?? this._returnAs);
    if (options?.sort) this.validateSort(options?.sort, returnAs);
    const filter: FilterQuery<any> = this.createFilter({ ...options, returnAs });
    const resp = new PaginatedResponseDto<V>();

    /*     resp.total = await this.countComplexDocuments({
      returnAs: options.returnAs,
      softDelete: options.softDelete,
    });
 */

    const { filterMiddleware, pipelineMiddleware /*, ...others*/ } = options;

    resp.filtered = await this.countComplexDocuments({
      filter,
      filterMiddleware,
      pipelineMiddleware,
      returnAs: options.returnAs,
      softDelete: options.softDelete,
    });

    resp.total = resp.filtered;

    const data = await this.findAllDocuments({
      ...options,
      skip: options.offset,
      filter,
      returnAs,
    });

    resp.showing = data.length;

    resp.limit = options.limit;
    resp.offset = options.offset;

    resp.data = data;

    return resp;
  }

  /**
   * Find many documents
   */
  async findAllDocuments<V = TReturnDto>(options?: FindAllDocumentsOpts<V>): Promise<V[]> {
    const returnAs = <ClassConstructor<V>>(<unknown>options?.returnAs ?? this._returnAs);

    // apply filter middleware
    const filter = options?.filterMiddleware
      ? options.filterMiddleware(options?.filter ?? {})
      : options?.filter;

    // use find or aggregate?
    let result;
    if (!this._hasSubSchemas(returnAs) && options?.useAggregate !== true) {
      result = await this._model.findAll(filter ?? {}, {
        ...options,
        ...this._getDefaultOptions<V>(returnAs),
      });
    } else {
      let pipeline = this._getDefaultPipeline(returnAs, { ...options, filter });
      if (options?.pipelineMiddleware) pipeline = options.pipelineMiddleware(pipeline);
      result = await this._model.aggregate({
        softDelete: options?.softDelete,
        pipeline,
      });
    }

    return <V[]>(<unknown>plainToInstance(returnAs, result, {
      ...this.defaultTransformOptions,
      ...options?.transformOptions,
    }));
  }

  /**
   * Find a single document
   */
  async findOneDocument<V = TReturnDto>(options?: FindOneDocumentOpts<V>): Promise<V | null> {
    const result = await this.findAllDocuments({ ...options, limit: 1 });
    return result && Array.isArray(result) && result.length >= 1 ? result.shift() ?? null : null;
  }

  /**
   * Find a single document by id
   */
  async findDocumentById<V = TReturnDto>(
    id: TKeyType,
    options?: FindDocumentByIdOpts<V>,
  ): Promise<V | null> {
    return await this.findOneDocument({ ...options, filter: { [this._model.getPk()]: id } });
  }

  /**
   * Create a single document by id
   */
  async createDocument<V = TReturnDto>(
    data: Partial<TDocument>,
    options?: InsertOptions & {
      returnAs?: ClassConstructor<V>;
      transformOptions?: ClassTransformOptions;
    } & { toObject?: true },
  ): Promise<V> {
    data = await this.beforeInsert<Partial<TDocument>>(data);
    const returnAs = <ClassConstructor<V>>(<unknown>options?.returnAs ?? this._returnAs);
    const result = await this._model.insert(data, {
      ...options,
      ...this._getDefaultOptions<V>(returnAs),
      toObject: true,
    });
    //
    let doc: any = result;
    if (
      result &&
      typeof result[this._model.getPk()] !== undefined &&
      this._hasSubSchemas(returnAs)
    ) {
      doc = await this.findDocumentById(<TKeyType>result[this._model.getPk()]);
    }
    //
    return plainToInstance(returnAs, doc, {
      ...this.defaultTransformOptions,
      ...options?.transformOptions,
    });
  }

  /**
   * Create many new documents
   */
  async createManyDocuments(data: Partial<TDocument>[]) {
    data.map(async (item) => await this.beforeInsert(item));
    const result = await this._model.insertMany(data);
    return result;
  }

  /**
   * Create many new documents
   */
  async createManyDocumentsAndReturnIt<V = TReturnDto>(
    data: Partial<TDocument>[],
    options?: InsertManyOptions & {
      returnAs?: ClassConstructor<V>;
      transformOptions?: ClassTransformOptions;
    },
  ): Promise<V[]> {
    const result = await this.createManyDocuments(data);
    const returnAs = <ClassConstructor<V>>(<unknown>options?.returnAs ?? this._returnAs);

    // make list
    const list: TKeyType[] = [];
    for (const k in result.insertedIds) {
      list.push(<TKeyType>(<unknown>result.insertedIds[k]));
    }

    const docs = await this.findAllDocuments({ filter: { [this._model.getPk()]: { $in: list } } });

    return <V[]>(<unknown>plainToInstance(returnAs, docs, {
      ...this.defaultTransformOptions,
      ...options?.transformOptions,
    }));
  }

  /**
   * Update a single document by id
   */
  async updateDocument<V = TReturnDto>(
    id: TKeyType,
    data: Partial<TDocument>,
    options?: UpdateOptions & {
      returnAs?: ClassConstructor<V>;
      transformOptions?: ClassTransformOptions;
    } & { toObject?: true },
  ): Promise<V | null> {
    data = await this.beforeUpdate(data);
    const returnAs = <ClassConstructor<V>>(<unknown>options?.returnAs ?? this._returnAs);
    const result = await this._model.update(id, data, {
      ...options,
      ...this._getDefaultOptions<V>(returnAs),
      toObject: true,
    });
    //
    let doc: any = result;
    if (
      result &&
      typeof (<any>(<unknown>result))[this._model.getPk()] !== undefined &&
      this._hasSubSchemas(returnAs)
    ) {
      doc = await this.findDocumentById(<TKeyType>(<any>(<unknown>result))[this._model.getPk()]);
    }
    //
    return plainToInstance(returnAs, doc, {
      ...this.defaultTransformOptions,
      ...options?.transformOptions,
    });
  }

  /**
   * Update many document and return update result stats
   */
  async updateMany<V = TReturnDto>(
    filter: FilterQuery<TDocument>,
    data: Partial<TDocument>,
    options?: UpdateManyOptions & {
      returnAs?: ClassConstructor<V>;
      transformOptions?: ClassTransformOptions;
    },
  ) {
    return await this._model.updateMany(filter, data, options);
  }

  /**
   * Update a single document and return update result stat
   */
  async updateOne<V = TReturnDto>(
    filter: FilterQuery<TDocument>,
    data: Partial<TDocument>,
    options?: UpdateOneOptions & { returnAs?: ClassConstructor<V> } & {
      transformOptions?: ClassTransformOptions;
    },
  ) {
    return await this._model.updateOne(filter, data, options);
  }

  /**
   * Delete many document and return delete result stats
   */
  async deleteManyDocuments(filter: FilterQuery<TDocument>, options?: DeleteManyOptions) {
    return await this._model.deleteMany(filter, options);
  }

  /**
   * Delete a single document and return delete result stat
   */
  async deleteOneDocument(filter: FilterQuery<TDocument>, options?: DeleteOneOptions) {
    return await this._model.deleteOne(filter, options);
  }

  /**
   * Delete and return affected
   */
  async deleteDocument(id: TKeyType, options?: DeleteOptions) {
    const result = <any>(<unknown>await this._model.delete(id, options));
    return this.calcAffectedDocuments(result);
  }

  /**
   * Verify than at least one document exists
   */
  async exists(filter: FilterQuery<TDocument>, options?: ExistsOption) {
    return await this._model.exists(filter, options);
  }

  /**
   * Verify than id document exist
   */
  async existsId(id: TKeyType, options?: ExistsOption) {
    return await this._model.existsId(id, options);
  }

  /**
   * Count documents
   */
  async countDocuments(filter: FilterQuery<TDocument> = {}, options?: CountOptions) {
    return await this._model.count(filter, options);
  }

  /**
   * Count documents with subschemas
   */
  async countComplexDocuments<V = TReturnDto>(
    options?: CountComplexDocumentsOpts<V>,
  ): Promise<number> {
    const returnAs = <ClassConstructor<V>>(<unknown>options?.returnAs ?? this._returnAs);

    // apply filter middleware
    const filter = options?.filterMiddleware
      ? options.filterMiddleware(options?.filter ?? {})
      : options?.filter;

    // apply pipeline middleware
    let pipeline = this._getDefaultPipeline(returnAs, { ...options, filter });
    if (options?.pipelineMiddleware) pipeline = options.pipelineMiddleware(pipeline);

    return await this._model.aggregateAndCount({
      softDelete: options?.softDelete,
      pipeline,
    });
  }

  protected calcAffectedDocuments(result: any) {
    let affected = 0;
    if (result.insertedCount) affected += result.insertedCount;
    if (result.modifiedCount) affected += result.modifiedCount;
    if (result.deletedCount) affected += result.deletedCount;
    return affected;
  }

  // Hooks
  async beforeInsert<T extends Partial<TDocument> = Partial<TDocument>>(data: T): Promise<T> {
    return data;
  }

  async beforeUpdate<T extends Partial<TDocument> = Partial<TDocument>>(data: T): Promise<T> {
    return data;
  }

  protected _getDefaultPipeline<T = TReturnDto>(
    schema: string | Function,
    options: Partial<Omit<FindAllDocumentsOpts<T>, 'returnAs' | 'transformOptions'>> = {},
  ): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] {
    //const schemaName = typeof schema === 'string' ? schema : schema.name;
    //if (!this._cachePipelines.has(schemaName)) {
    const pipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] = [];
    const schemaMetadata = this._metadata.getSchema(schema);
    if (schemaMetadata !== undefined) {
      // Lookup
      this._getLookupsAndUnwind(schemaMetadata).forEach((stage) => pipeline.push(stage));
      // Match
      if (options?.filter !== undefined) pipeline.push({ $match: options.filter });
      // Sort
      if (options?.sort !== undefined) pipeline.push({ $sort: options.sort });
      // Projection
      pipeline.push({ $project: this._getProjection(schema) });
      // Skip
      if (options?.skip !== undefined) pipeline.push({ $skip: options.skip });
      // Limit
      if (options?.limit !== undefined) pipeline.push({ $limit: options.limit });
    }
    //this._cachePipelines.set(schemaName, pipelines);
    //}
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //return this._cachePipelines.get(schemaName)!;
    return pipeline;
  }

  protected _getProjection(schema: Function | string) {
    return this.__getProjection(schema);
  }

  protected _getFullProjection(schema: Function | string) {
    return this.__getProjection(schema, false);
  }

  protected __getProjection(
    schema: Function | string,
    onlyTopLevel = true,
    parents: string[] = [],
    value: 1 | 'type' = 1,
  ) {
    let schemaKey = typeof schema === 'string' ? schema : schema.name;
    schemaKey += onlyTopLevel ? '_top_' + value : '_full_' + value;
    if (!this._cacheProjections.has(schemaKey)) {
      let projection: { [field: string]: any } = {};
      const schemaMetadata = this._metadata.getSchema(schema);
      if (schemaMetadata !== undefined) {
        for (const [property, propDef] of schemaMetadata.props.entries()) {
          if (propDef.options.transformer?.expose || !propDef.options.transformer?.exclude) {
            const lookup = propDef.metadata.get(METADATA.MONGOOSE_LOOKUP) as LookupOpts;
            if (onlyTopLevel || lookup === undefined) {
              const key = [...parents, property].join('.');
              projection[key] = value === 1 ? 1 : propDef.type.type;
            } else {
              const subschemaProjection = this.__getProjection(
                propDef.type.type,
                onlyTopLevel,
                [...parents, property],
                value,
              );
              projection = { ...projection, ...subschemaProjection };
            }
          }
        }
        this._cacheProjections.set(schemaKey, projection);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._cacheProjections.get(schemaKey)!;
  }

  protected _getLookupsAndUnwind(
    schemaMetadata: SchemaDef,
  ): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] {
    const pipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] = [];
    for (const [property, propDef] of schemaMetadata.props.entries()) {
      const lookup = propDef.metadata.get(METADATA.MONGOOSE_LOOKUP) as LookupOpts;
      if (lookup !== undefined) {
        if (propDef.options.transformer?.expose || !propDef.options.transformer?.exclude) {
          pipeline.push({
            $lookup: {
              from: lookup.from,
              as: property,
              localField: lookup.localField,
              foreignField: lookup.foreignField,
              pipeline: this._getDefaultPipeline(propDef.type?.type, {
                limit: lookup.justOne ? 1 : undefined,
              }),
            },
          });
          if ((lookup.justOne ?? false) === true) {
            pipeline.push({
              $unwind: {
                path: '$' + property,
                preserveNullAndEmptyArrays: lookup.preserveNullAndEmptyArrays ?? false,
              },
            });
          }
          // Has nested childs?
          /*
          const nestedPipelines = this._getPipelines(propDef.type?.type, [...parents, property]);
          nestedPipelines.forEach((stage) => {
            pipeline.push(stage);
          });
          */
        }
      }
    }
    return pipeline;
  }

  /**
   * Detect if schema has props with subschemas
   */
  public _hasSubSchemas(schema: Function | string): boolean {
    const schemaMetadata = this._metadata.getSchema(schema);
    if (schemaMetadata !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [property, propDef] of schemaMetadata.props.entries()) {
        const lookup = propDef.metadata.get(METADATA.MONGOOSE_LOOKUP) as LookupOpts;
        if (lookup !== undefined) return true;
      }
    }
    return false;
  }

  protected _getDefaultOptions<V>(returnAs: ClassConstructor<V>) {
    return {
      toObject: true,
      projection: this._getProjection(returnAs),
    };
  }

  get model() {
    return this._model;
  }
}
