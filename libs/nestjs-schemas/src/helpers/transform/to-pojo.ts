import { TransformFnParams } from 'class-transformer';
import {
  CastToPojoOptions,
  castToPojo as castToPojoFn,
  CastToPojoArrayOptions,
  castToPojoArray as castToPojoArrayFn,
} from '../cast';

export function TransformToPojo(options: CastToPojoOptions = {}) {
  return (params: TransformFnParams) => {
    return castToPojoFn(params.obj[params.key], options);
  };
}

export function TransformToPojoArray(options: CastToPojoArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToPojoArrayFn(params.obj[params.key], options);
  };
}
