import {
  $PropEnum,
  $PropNumberOptional,
  $PropString,
  $PropStringOptional,
  $Schema,
} from '../decorators';
import { IsJSON } from 'class-validator';

export enum SortDirEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

@$Schema()
export class SortParamDto {
  @$PropString()
  key!: string;

  @$PropEnum({
    enum: SortDirEnum,
    enumName: 'SortDirEnum',
  })
  dir!: SortDirEnum;
}
