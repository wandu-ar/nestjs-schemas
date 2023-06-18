import { TransformFnParams } from 'class-transformer';
import {
  CastToObjectIdOptions,
  castToObjectId,
  CastToObjectIdArrayOptions,
  castToObjectIdArray,
} from '../cast';

export function TransformToObjectId(options: CastToObjectIdOptions = {}) {
  return (params: TransformFnParams) => {
    return castToObjectId(params.obj[params.key], options);
  };
}

export function TransformToObjectIdArray(options: CastToObjectIdArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToObjectIdArray(params.obj[params.key], options);
  };
}
