import { TransformFnParams } from 'class-transformer';
import { CastToPojoOptions, castToPojo, CastToPojoArrayOptions, castToPojoArray } from '../cast';

export function TransformToPojo(options: CastToPojoOptions = {}) {
  return (params: TransformFnParams) => {
    return castToPojo(params.obj[params.key], options);
  };
}

export function TransformToPojoArray(options: CastToPojoArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToPojoArray(params.obj[params.key], options);
  };
}
