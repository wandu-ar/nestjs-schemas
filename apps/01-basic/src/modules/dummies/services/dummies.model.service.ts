import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseModel } from '@wandu-ar/nestjs-schemas';
import { DUMMY_SCHEMA, Dummy, DUMMY_PK } from '../schemas';

@Injectable()
export class DummiesModelService extends BaseModel<Dummy, typeof DUMMY_PK> {
  constructor(
    @InjectModel(DUMMY_SCHEMA)
    protected readonly _model: Model<Dummy>,
  ) {
    super(_model, DUMMY_PK);
  }
}
