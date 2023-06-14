import { $Prop, $PropNumberOptional, $PropStringOptional, $Schema } from '../decorators';
import { IsObject, IsOptional } from 'class-validator';
import { QueryOptions } from 'mongoose';
import { TransformToPojo } from '../helpers';
import { RuleSet } from '../types';

@$Schema()
export class ListParamsDto<T = any> {
  @$PropNumberOptional({ min: 1, isInt: true })
  limit?: number;

  @$PropNumberOptional({ min: 0, isInt: true })
  offset?: number;

  @$Prop({
    swagger: { type: 'object', required: false },
    transformer: { expose: true, transform: [[TransformToPojo(), { toClassOnly: true }]] },
    validators: [IsOptional(), IsObject()],
  })
  sort?: Pick<QueryOptions<T>, 'sort'>;

  @$Prop({
    swagger: { type: 'object', required: false },
    transformer: { expose: true, transform: [[TransformToPojo(), { toClassOnly: true }]] },
    validators: [IsOptional(), IsObject()],
  })
  filter?: RuleSet;

  @$PropStringOptional()
  query?: string;
}
