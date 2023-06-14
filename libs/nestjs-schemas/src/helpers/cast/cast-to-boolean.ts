import { CastToOptions, castTo } from './cast-to';

//export type CastToBoolean = {};

export type CastToBooleanOptions = CastToOptions<boolean> /* & CastToBoolean*/;

export type CastToBooleanArrayOptions = CastToOptions<boolean[]> /* & CastToBoolean*/;

export function castToBoolean(value: any, options: CastToBooleanOptions = {}) {
  return castTo(value, false, castToBooleanFn, options, { ...options });
}

export function castToBooleanArray(value: any, options: CastToBooleanArrayOptions = {}) {
  return castTo(value, true, castToBooleanFn, options, { ...options });
}

export function castToBooleanFn(value: any /*, options: CastToBoolean = {}*/) {
  let newValue: boolean;
  if (typeof value === 'boolean') {
    newValue = value;
  } else {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      newValue = trimmed !== '0' && trimmed.toLowerCase() !== 'false' && trimmed !== '';
    } else {
      newValue = Boolean(value);
    }
  }
  return newValue;
}
