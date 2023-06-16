import { TransformFnParams } from 'class-transformer';
import {
  CastToNumberOptions,
  castToNumber as castToNumberFn,
  CastToNumberArrayOptions,
  castToNumberArray as castToNumberArrayFn,
} from '../cast';

export function TransformToNumber(options: CastToNumberOptions = {}) {
  return (params: TransformFnParams) => {
    return castToNumberFn(params.obj[params.key], options);
  };
}

export function TransformToNumberArray(options: CastToNumberArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToNumberArrayFn(params.obj[params.key], options);
  };
}
