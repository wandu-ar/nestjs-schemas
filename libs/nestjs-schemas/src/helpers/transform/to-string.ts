import { TransformFnParams } from 'class-transformer';
import {
  CastToStringOptions,
  castToString,
  CastToStringArrayOptions,
  castToStringArray,
} from '../cast';

export function TransformToString(options: CastToStringOptions = {}) {
  return (params: TransformFnParams) => {
    return castToString(params.obj[params.key], options);
  };
}

export function TransformToStringArray(options: CastToStringArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToStringArray(params.obj[params.key], options);
  };
}
