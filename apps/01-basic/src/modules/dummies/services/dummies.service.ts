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

  // async beforeSave<Partial<Dummy>>(data: Partial<Dummy>) {
  //   if (!data.id) data.id = v4();
  //   return data;
  // }

  async beforeSave(data: Partial<Dummy>) {
    //if (!data.id) data.id = v4();
    return data;
  }
}
