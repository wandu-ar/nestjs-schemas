import {
  $PropNumberOptional,
  $PropPojoOptional,
  $PropStringOptional,
  $Schema,
} from '../decorators';

@$Schema()
export class ListParamsDto {
  @$PropNumberOptional({ min: 1, isInt: true })
  limit?: number;

  @$PropNumberOptional({ min: 0, isInt: true })
  offset?: number;

  @$PropPojoOptional()
  sort?: object;

  @$PropPojoOptional()
  filter?: object;

  @$PropStringOptional()
  query?: string;
}
