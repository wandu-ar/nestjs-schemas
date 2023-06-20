import { Injectable, Logger } from '@nestjs/common';
import { BaseService, MetadataService, generateUUIDv4 } from '@wandu-ar/nestjs-schemas';
import { ManikinsModelService } from './manikins.model.service';
import { MANIKIN_PK, Manikin } from '../schemas';
import { ManikinDto } from '../dtos';

@Injectable()
export class ManikinsService extends BaseService<
  Manikin,
  typeof MANIKIN_PK,
  ManikinsModelService,
  ManikinDto
> {
  constructor(
    protected readonly _metadata: MetadataService,
    protected readonly _model: ManikinsModelService,
  ) {
    super(_metadata, _model, ManikinDto);
    Logger.debug('ManikinsService has been loaded.');
  }

  async beforeInsert<T extends Partial<Manikin>>(data: T) {
    if (!data[MANIKIN_PK]) data[MANIKIN_PK] = generateUUIDv4();
    if (!data['createdAt']) data['createdAt'] = new Date();
    if (!data['updatedAt']) data['updatedAt'] = new Date(data['createdAt']);
    return data;
  }

  async beforeUpdate<T extends Partial<Manikin>>(data: T) {
    if (!data['updatedAt']) data['updatedAt'] = new Date();
    return data;
  }
}
