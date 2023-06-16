import { TransformFnParams } from 'class-transformer';
import {
  CastToUUIDv4Options,
  castToUUIDv4 as castToUUIDv4Fn,
  CastToUUIDv4ArrayOptions,
  castToUUIDv4Array as castToUUIDv4ArrayFn,
} from '../cast';

export function TransformToUUIDv4(options: CastToUUIDv4Options = {}) {
  return (params: TransformFnParams) => {
    return castToUUIDv4Fn(params.obj[params.key], options);
  };
}

export function TransformToUUIDv4Array(options: CastToUUIDv4ArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToUUIDv4ArrayFn(params.obj[params.key], options);
  };
}
