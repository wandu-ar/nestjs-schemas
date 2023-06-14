import { TransformFnParams } from 'class-transformer';
import {
  CastToDateOptions,
  castToDate as castToDateFn,
  CastToDateArrayOptions,
  castToDateArray as castToDateArrayFn,
} from '../cast';

export function TransformToDate(options: CastToDateOptions = {}) {
  return (params: TransformFnParams) => {
    return castToDateFn(params.obj[params.key], options);
  };
}

export function TransformToDateArray(options: CastToDateArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToDateArrayFn(params.obj[params.key], options);
  };
}
