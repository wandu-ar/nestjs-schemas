import { TransformFnParams } from 'class-transformer';
import {
  CastToObjectOptions,
  castToObject,
  CastToObjectArrayOptions,
  castToObjectArray,
} from '../cast';

export function TransformToObject(options: CastToObjectOptions = {}) {
  return (params: TransformFnParams) => {
    return castToObject(params.obj[params.key], options);
  };
}

export function TransformToObjectArray(options: CastToObjectArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToObjectArray(params.obj[params.key], options);
  };
}
