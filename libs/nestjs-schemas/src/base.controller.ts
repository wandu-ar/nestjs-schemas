import { NotFoundException } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { Document } from 'mongoose';
import { ObjectId } from './types';
import { BaseModel, DeleteOptions } from './base.model';
import { BaseService, FindAllDocumentsOpts, FindDocumentByIdOpts } from './base.service';

/**
 * Gateway entre request y servicios.
 *
 * @author Alejandro D. Guevara
 */
export abstract class BaseController<
  TDocument extends Document,
  TModel extends BaseModel<TDocument>,
  TService extends BaseService<TDocument, TModel, TReturnDto>,
  TReturnDto,
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

  protected async _findAll<V = TReturnDto>(options?: FindAllDocumentsOpts<V>) {
    return await this._service.findAllDocuments<V>(options);
  }

  /**
   * Find resource by ID
   */
  protected async _findById<V = TReturnDto>(id: ObjectId, options?: FindDocumentByIdOpts<V>) {
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
    id: ObjectId,
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
  protected async _delete(id: ObjectId, options?: DeleteOptions) {
    const result = await this._service.deleteDocument(id, options);
    if (!result) throw new NotFoundException();
  }
}
