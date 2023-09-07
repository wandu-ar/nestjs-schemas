/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from 'class-transformer';
import { FilterQuery, PipelineStage } from 'mongoose';
import { SchemaDef } from './types';
import {
  DEFAULT_ID_FIELD_NAME,
  defaultTransformOptions,
  METADATA,
} from './constants';
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

export type FindAllDocumentsOpts<T> = Omit<
  FindAllOptions<T>,
  'toObject' | 'projection'
> & {
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
  filter?: object;
  sort?: object;
  returnAs?: ClassConstructor<T>;
  transformOptions?: ClassTransformOptions;
} & SoftDeleteOption &
  Pick<
    FindAllDocumentsOpts<T>,
    'useAggregate' | 'filterMiddleware' | 'pipelineMiddleware'
  >;

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
      newString = newString.trim().replace(/°/g, 'º');
      // TODO: Mejorar. Dado que tmb evita tíldes...
      //.replace(/[^\w\s+\-.,;:°ºª_"\/@<>=]/giu, '');
      if (!newString || typeof newString !== 'string') newString = '';
      // quitar espacios en blanco duplicados
      newString = newString.replace(/\s{2,}/g, ' ');
    } catch (err) {
      newString = '';
    }

    return newString;
  }

  validateSort(sort: any, schema: Function | string) {
    this._validateSort(sort, this._metadata.getFullProjection(schema));
  }

  protected _validateSort(input: any, projection: any) {
    const keys = Object.getOwnPropertyNames(input);
    const possibleKeys = Object.getOwnPropertyNames(projection);
    for (const key of keys) {
      if (
        !possibleKeys.includes(key) ||
        (input[key] !== 1 && input[key] !== -1)
      )
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
    const hasFilter =
      options.filter && Object.getOwnPropertyNames(options.filter).length;
    const projection = this._metadata._getProjection(
      options.returnAs,
      false,
      [],
      'type',
    );

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
        if (
          projection[path] === 'String' ||
          projection[path] === 'SchemaString'
        ) {
          const def: FilterQuery<any> = {};
          def[path] = {
            $regex: new RegExp('.*' + this._regexScape(term) + '.*', 'iu'),
          };
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
    const returnAs = <ClassConstructor<V>>(
      (<unknown>options?.returnAs ?? this._returnAs)
    );
    if (options?.sort) this.validateSort(options?.sort, returnAs);
    const filter: FilterQuery<any> = this.createFilter({
      ...options,
      returnAs,
    });
    const resp = new PaginatedResponseDto<V>();

    /*     resp.total = await this.countComplexDocuments({
      returnAs: options.returnAs,
      softDelete: options.softDelete,
    });
 */

    const { filterMiddleware, pipelineMiddleware /*, ...others*/ } = options;

    resp.total = await this.countComplexDocuments({
      filter,
      filterMiddleware,
      pipelineMiddleware,
      returnAs: options.returnAs,
      softDelete: options.softDelete,
    });

    resp.filtered = resp.total;

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
  async findAllDocuments<V = TReturnDto>(
    options?: FindAllDocumentsOpts<V>,
  ): Promise<V[]> {
    const returnAs = <ClassConstructor<V>>(
      (<unknown>options?.returnAs ?? this._returnAs)
    );

    // apply filter middleware
    const filter = options?.filterMiddleware
      ? options.filterMiddleware(options?.filter ?? {})
      : options?.filter;

    // use find or aggregate?
    let result;
    if (
      !this._hasSubSchemas(returnAs) &&
      options?.useAggregate !== true &&
      !options?.pipelineMiddleware
    ) {
      result = await this._model.findAll(filter ?? {}, {
        ...options,
        ...this._getDefaultOptions<V>(returnAs),
      });
    } else {
      let pipeline = this._getDefaultPipeline(returnAs, { ...options, filter });
      if (options?.pipelineMiddleware)
        pipeline = options.pipelineMiddleware(pipeline);
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
  async findOneDocument<V = TReturnDto>(
    options?: FindOneDocumentOpts<V>,
  ): Promise<V | null> {
    const result = await this.findAllDocuments({ ...options, limit: 1 });
    return result && Array.isArray(result) && result.length >= 1
      ? result.shift() ?? null
      : null;
  }

  /**
   * Find a single document by id
   */
  async findDocumentById<V = TReturnDto>(
    id: TKeyType,
    options?: FindDocumentByIdOpts<V>,
  ): Promise<V | null> {
    return await this.findOneDocument({
      ...options,
      filter: { [this._model.getPk()]: id },
    });
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
    const returnAs = <ClassConstructor<V>>(
      (<unknown>options?.returnAs ?? this._returnAs)
    );
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
    const returnAs = <ClassConstructor<V>>(
      (<unknown>options?.returnAs ?? this._returnAs)
    );

    // make list
    const list: TKeyType[] = [];
    for (const k in result.insertedIds) {
      list.push(<TKeyType>(<unknown>result.insertedIds[k]));
    }

    const docs = await this.findAllDocuments({
      filter: { [this._model.getPk()]: { $in: list } },
    });

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
    const returnAs = <ClassConstructor<V>>(
      (<unknown>options?.returnAs ?? this._returnAs)
    );
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
      doc = await this.findDocumentById(
        <TKeyType>(<any>(<unknown>result))[this._model.getPk()],
      );
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
    return await this._model.updateMany(
      filter,
      await this.beforeUpdate(data),
      options,
    );
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
    return await this._model.updateOne(
      filter,
      await this.beforeUpdate(data),
      options,
    );
  }

  /**
   * Delete many document and return delete result stats
   */
  async deleteManyDocuments(
    filter: FilterQuery<TDocument>,
    options?: DeleteManyOptions,
  ) {
    return await this._model.deleteMany(filter, options);
  }

  /**
   * Delete a single document and return delete result stat
   */
  async deleteOneDocument(
    filter: FilterQuery<TDocument>,
    options?: DeleteOneOptions,
  ) {
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
  async countDocuments(
    filter: FilterQuery<TDocument> = {},
    options?: CountOptions,
  ) {
    return await this._model.count(filter, options);
  }

  /**
   * Count documents with subschemas
   */
  async countComplexDocuments<V = TReturnDto>(
    options?: CountComplexDocumentsOpts<V>,
  ): Promise<number> {
    const returnAs = <ClassConstructor<V>>(
      (<unknown>options?.returnAs ?? this._returnAs)
    );

    // apply filter middleware
    const filter = options?.filterMiddleware
      ? options.filterMiddleware(options?.filter ?? {})
      : options?.filter;

    // apply pipeline middleware
    let pipeline = this._getDefaultPipeline(returnAs, { ...options, filter });
    if (options?.pipelineMiddleware)
      pipeline = options.pipelineMiddleware(pipeline);

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
  async beforeInsert<T extends Partial<TDocument> = Partial<TDocument>>(
    data: T,
  ): Promise<T> {
    return data;
  }

  async beforeUpdate<T extends Partial<TDocument> = Partial<TDocument>>(
    data: T,
  ): Promise<T> {
    return data;
  }

  protected _getDefaultPipeline<T = TReturnDto>(
    schema: string | Function,
    options: Partial<
      Omit<FindAllDocumentsOpts<T>, 'returnAs' | 'transformOptions'>
    > = {},
  ): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] {
    //const schemaName = typeof schema === 'string' ? schema : schema.name;
    //if (!this._cachePipelines.has(schemaName)) {
    const pipeline: Exclude<
      PipelineStage,
      PipelineStage.Merge | PipelineStage.Out
    >[] = [];
    const schemaMetadata = this._metadata.getSchema(schema);
    if (schemaMetadata !== undefined) {
      // Lookup
      this._getLookupsAndUnwind(schema).forEach((stage) =>
        pipeline.push(stage),
      );
      // Match
      if (options?.filter !== undefined)
        pipeline.push({ $match: options.filter });
      // Sort
      if (options?.sort !== undefined) pipeline.push({ $sort: options.sort });
      // Projection
      pipeline.push({ $project: this._metadata.getProjection(schema) });
      // Skip
      if (options?.skip !== undefined) pipeline.push({ $skip: options.skip });
      // Limit
      if (options?.limit !== undefined)
        pipeline.push({ $limit: options.limit });
    }
    //this._cachePipelines.set(schemaName, pipelines);
    //}
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //return this._cachePipelines.get(schemaName)!;
    return pipeline;
  }

  protected _getLookupsAndUnwind(
    schema: string | Function,
  ): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] {
    //
    const pipeline: Exclude<
      PipelineStage,
      PipelineStage.Merge | PipelineStage.Out
    >[] = [];
    //
    const propsLookups = this._getPropsLookups(schema, []);
    // console.log(propsLookups);
    for (const prop in propsLookups) {
      const propData = propsLookups[prop];
      const lookup = propData.lookup;
      const parents = prop.split('.');
      parents.pop();
      const parentPath = parents.join('.');
      parents.push(lookup.localField);
      const localField = parents.join('.');
      if (!propData.inArray) {
        // Simple lookup an unwind
        pipeline.push({
          $lookup: {
            from: lookup.from,
            as: prop,
            localField,
            foreignField: lookup.foreignField,
            pipeline: this._getDefaultPipeline(propData.propDef.type.type, {
              limit: lookup.justOne ? 1 : undefined,
            }),
          },
        });
        if ((lookup.justOne ?? false) === true) {
          pipeline.push({
            $unwind: {
              path: '$' + prop,
              preserveNullAndEmptyArrays:
                lookup.preserveNullAndEmptyArrays ?? false,
            },
          });
        }
      } else {
        // Lookup in array of objects - More complex pipeline
        // @see https://stackoverflow.com/a/72345529/21000857
        //
        const tmpField = '__tempLookup__';
        // Save lookup in a tmp field
        pipeline.push({
          $lookup: {
            from: lookup.from,
            as: tmpField,
            localField: localField,
            foreignField: lookup.foreignField,
            pipeline: this._getDefaultPipeline(propData.propDef.type.type, {
              limit: lookup.justOne ? 1 : undefined,
            }),
          },
        });
        // Copy values of tmp in the original place
        // TODO: Reparar porque no va a funcionar en niveles cuyos campos contengan puntos.
        pipeline.push({
          $set: {
            [parentPath]: {
              $map: {
                input: `$${parentPath}`,
                in: {
                  $mergeObjects: [
                    '$$this',
                    {
                      [propData.propName]: {
                        $arrayElemAt: [
                          `$${tmpField}`,
                          {
                            $indexOfArray: [
                              `$${tmpField}.${DEFAULT_ID_FIELD_NAME}`,
                              `$$this.${lookup.localField}`,
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        });
        // Delete tmp field
        pipeline.push({ $unset: tmpField });
      }
    }
    return pipeline;
  }

  _getPropsLookups(
    schema: Function | string,
    parents: string[] = [],
    level = 1,
    inArray = false,
  ) {
    let propsLookups: { [field: string]: any } = {};
    const schemaMetadata = this._metadata.getSchema(schema);
    if (schemaMetadata !== undefined) {
      for (const [propName, propDef] of schemaMetadata.props.entries()) {
        if (
          propDef.options.transformer?.expose ||
          !propDef.options.transformer?.exclude
        ) {
          // prop with lookup?
          const lookup = propDef.metadata.get(
            METADATA.MONGOOSE_LOOKUP,
          ) as LookupOpts;
          if (lookup) {
            const key = [...parents, propName].join('.');
            propsLookups[key] = {
              lookup,
              propName,
              propDef,
              level,
              inArray,
            };
          } else {
            // tendrá lookups dentro?
            const subPropsLookups = this._getPropsLookups(
              propDef.type.type,
              [...parents, propName],
              level + 1,
              propDef.type.isArray,
            );
            //
            if (Object.keys(subPropsLookups).length) {
              propsLookups = {
                ...propsLookups,
                ...subPropsLookups,
              };
            }
          }
        }
      }
    }
    return propsLookups;
  }

  /**
   * @deprecated
   */
  protected _getLookupsAndUnwindOld(
    schemaMetadata: SchemaDef,
  ): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] {
    const pipeline: Exclude<
      PipelineStage,
      PipelineStage.Merge | PipelineStage.Out
    >[] = [];
    for (const [property, propDef] of schemaMetadata.props.entries()) {
      const lookup = propDef.metadata.get(
        METADATA.MONGOOSE_LOOKUP,
      ) as LookupOpts;
      if (lookup !== undefined) {
        if (
          propDef.options.transformer?.expose ||
          !propDef.options.transformer?.exclude
        ) {
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
                preserveNullAndEmptyArrays:
                  lookup.preserveNullAndEmptyArrays ?? false,
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
        const lookup = propDef.metadata.get(
          METADATA.MONGOOSE_LOOKUP,
        ) as LookupOpts;
        if (lookup !== undefined) return true;
      }
    }
    return false;
  }

  protected _getDefaultOptions<V>(returnAs: ClassConstructor<V>) {
    return {
      toObject: true,
      projection: this._metadata.getProjection(returnAs),
    };
  }

  get model() {
    return this._model;
  }
}
