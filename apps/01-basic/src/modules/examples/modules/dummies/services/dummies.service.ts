import { Injectable, Logger } from '@nestjs/common';
import { BaseService, MetadataService, generateUUIDv4 } from '@wandu/nestjs-schemas';
import { DummiesModelService } from './dummies.model.service';
import { DUMMY_PK, Dummy } from '../schemas';
import { DummyDto } from '../dtos';

@Injectable()
export class DummiesService extends BaseService<
  Dummy,
  typeof DUMMY_PK,
  DummiesModelService,
  DummyDto
> {
  constructor(
    protected readonly _metadata: MetadataService,
    protected readonly _model: DummiesModelService,
  ) {
    super(_metadata, _model, DummyDto);
    Logger.debug('DummiesService has been loaded.');
  }

  async beforeInsert<T extends Partial<Dummy>>(data: T) {
    if (!data[DUMMY_PK]) data[DUMMY_PK] = generateUUIDv4();
    if (!data['createdAt']) data['createdAt'] = new Date();
    if (!data['updatedAt']) data['updatedAt'] = new Date(data['createdAt']);
    return data;
  }

  async beforeUpdate<T extends Partial<Dummy>>(data: T) {
    if (!data['updatedAt']) data['updatedAt'] = new Date();
    return data;
  }
}
