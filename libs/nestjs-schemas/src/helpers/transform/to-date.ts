import { TransformFnParams } from 'class-transformer';
import { CastToDateOptions, castToDate, CastToDateArrayOptions, castToDateArray } from '../cast';

export function TransformToDate(options: CastToDateOptions = {}) {
  return (params: TransformFnParams) => {
    return castToDate(params.obj[params.key], options);
  };
}

export function TransformToDateArray(options: CastToDateArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToDateArray(params.obj[params.key], options);
  };
}
