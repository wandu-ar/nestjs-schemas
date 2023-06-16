import { Injectable } from '@nestjs/common';
import { BaseService, MetadataService } from '@wandu-ar/nestjs-schemas';
import { DummiesModelService } from './dummies.model.service';
import { DUMMY_PK, Dummy } from '../schemas';
import { DummyDto } from '../dtos';
import { v4 } from 'uuid-mongodb';

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
  }

  async beforeSave<T extends Partial<Dummy>>(data: T) {
    if (!data[DUMMY_PK]) data[DUMMY_PK] = v4();
    return data;
  }
}
