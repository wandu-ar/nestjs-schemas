import { Injectable, Logger } from '@nestjs/common';
import { BaseService, MetadataService, generateUUIDv4 } from '@wandu/nestjs-schemas';
import { LegsModelService } from './legs.model.service';
import { LEG_PK, Leg } from '../schemas';
import { LegDto } from '../dtos';

@Injectable()
export class LegsService extends BaseService<
  Leg,
  typeof LEG_PK,
  LegsModelService,
  LegDto
> {
  constructor(
    protected readonly _metadata: MetadataService,
    protected readonly _model: LegsModelService,
  ) {
    super(_metadata, _model, LegDto);
    Logger.debug('LegsService has been loaded.');
  }

  async beforeInsert<T extends Partial<Leg>>(data: T) {
    if (!data[LEG_PK]) data[LEG_PK] = generateUUIDv4();
    if (!data['createdAt']) data['createdAt'] = new Date();
    if (!data['updatedAt']) data['updatedAt'] = new Date(data['createdAt']);
    return data;
  }

  async beforeUpdate<T extends Partial<Leg>>(data: T) {
    if (!data['updatedAt']) data['updatedAt'] = new Date();
    return data;
  }
}
