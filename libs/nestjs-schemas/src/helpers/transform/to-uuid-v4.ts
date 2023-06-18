import { TransformFnParams } from 'class-transformer';
import {
  CastToUUIDv4Options,
  castToUUIDv4,
  CastToUUIDv4ArrayOptions,
  castToUUIDv4Array,
} from '../cast';

export function TransformToUUIDv4(options: CastToUUIDv4Options = {}) {
  return (params: TransformFnParams) => {
    return castToUUIDv4(params.obj[params.key], options);
  };
}

export function TransformToUUIDv4Array(options: CastToUUIDv4ArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToUUIDv4Array(params.obj[params.key], options);
  };
}
