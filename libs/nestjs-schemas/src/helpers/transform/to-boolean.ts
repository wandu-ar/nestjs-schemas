import { TransformFnParams } from 'class-transformer';
import {
  CastToBooleanOptions,
  castToBoolean,
  CastToBooleanArrayOptions,
  castToBooleanArray,
} from '../cast';

export function TransformToBoolean(options: CastToBooleanOptions = {}) {
  return (params: TransformFnParams) => {
    return castToBoolean(params.obj[params.key], options);
  };
}

export function TransformToBooleanArray(options: CastToBooleanArrayOptions = {}) {
  return (params: TransformFnParams) => {
    return castToBooleanArray(params.obj[params.key], options);
  };
}
