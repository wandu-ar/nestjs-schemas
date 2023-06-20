import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseModel } from '@wandu/nestjs-schemas';
import { MANIKIN_SCHEMA, Manikin, MANIKIN_PK } from '../schemas';

@Injectable()
export class ManikinsModelService extends BaseModel<Manikin, typeof MANIKIN_PK> {
  constructor(
    @InjectModel(MANIKIN_SCHEMA)
    protected readonly _model: Model<Manikin>,
  ) {
    super(_model, MANIKIN_PK);
    Logger.debug('ManikinsModelService has been loaded.');
  }
}
