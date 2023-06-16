import { NotFoundException } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
//import { ObjectId } from './types';
import { BaseModel, DeleteOptions } from './base.model';
import {
  BaseService,
  //FindAllDocumentsOpts,
  FindDocumentByIdOpts,
  ListAllDocumentsOpts,
} from './base.service';
import { ListParamsDto } from './schemas';

/**
 * Gateway entre request y servicios.
 *
 * @author Alejandro D. Guevara
 */
export abstract class BaseController<
  TDocument,
  TKey extends string & keyof TDocument,
  TModel extends BaseModel<TDocument, TKey, TKeyType>,
  TService extends BaseService<TDocument, TKey, TModel, TReturnDto, TKeyType>,
  TReturnDto,
  TKeyType = TDocument[TKey],
> {
  constructor(protected readonly _service: TService) {}

  /*   protected async _list<V = TReturnDto>(
    options: ListParams<TDocument> & {
      returnAs?: ClassConstructor<V>;
    } = {},
  ) {
    let filter: FilterQuery<TDocument> = options?.filter ?? {};

    if (options?.query) {
      filter = filter ?? {};
      filter['$text'] = { $search: options?.query };
    }

    delete options.filter;
    delete options.query;

    return await this._service.findAllDocuments<V>(filter, options);
  } */

  // protected async _findAll<V = TReturnDto>(options?: FindAllDocumentsOpts<V>) {
  //   return await this._service.findAllDocuments<V>(options);
  // }

  protected async _listAllDocuments<V = TReturnDto>(
    params: ListParamsDto,
    options?: ListAllDocumentsOpts<V>,
  ) {
    return await this._service.listAllDocuments<V>({
      searchQuery: params.query,
      filter: params.filter,
      limit: params.limit ?? 10, // TODO: Pasar a config
      offset: params.offset ?? 0,
      sort: params.sort,
      ...options,
    });
  }

  /**
   * Find resource by ID
   */
  protected async _findById<V = TReturnDto>(id: TKeyType, options?: FindDocumentByIdOpts<V>) {
    const document = await this._service.findDocumentById<V>(id, options);
    if (!document) throw new NotFoundException();
    return document;
  }

  /**
   * Create new resource
   */
  protected async _create<TCreateDto extends Partial<TDocument>, V = TReturnDto>(
    body: TCreateDto,
    options?: { returnAs?: ClassConstructor<V> },
  ) {
    return await this._service.createDocument<V>(body, { ...options });
  }

  /**
   * Update resource
   */
  protected async _update<TUpdateDto extends Partial<TDocument>, V = TReturnDto>(
    id: TKeyType,
    body: TUpdateDto,
    options?: { returnAs?: ClassConstructor<V> },
  ) {
    const document = await this._service.updateDocument<V>(id, body, {
      ...options,
    });
    if (!document) throw new NotFoundException();
    return document;
  }

  /**
   * Delete resource
   */
  protected async _delete(id: TKeyType, options?: DeleteOptions) {
    const result = await this._service.deleteDocument(id, options);
    if (!result) throw new NotFoundException();
  }
}
