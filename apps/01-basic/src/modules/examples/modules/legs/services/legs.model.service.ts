import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseModel } from '@wandu/nestjs-schemas';
import { LEG_SCHEMA, Leg, LEG_PK } from '../schemas';

@Injectable()
export class LegsModelService extends BaseModel<Leg, typeof LEG_PK> {
  constructor(
    @InjectModel(LEG_SCHEMA)
    protected readonly _model: Model<Leg>,
  ) {
    super(_model, LEG_PK);
    Logger.debug('LegsModelService has been loaded.');
  }
}
