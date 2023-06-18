import { TransformFnParams } from 'class-transformer';
import {
  CastToNumberOptions,
  castToNumber,
  CastToNumberArrayOptions,
  castToNumberArray,
} from '../cast';

export function TransformToNumber(options: CastToNumberOptions = {}) {
  return (params: TransformFnParams) => {
    return castToNumber(params.obj[params.key], options);
  };
}

export function TransformToNumberArray(options: CastToNumberArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToNumberArray(params.obj[params.key], options);
  };
}
