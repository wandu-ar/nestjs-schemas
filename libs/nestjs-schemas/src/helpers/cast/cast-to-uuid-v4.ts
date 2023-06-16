import { isUUID } from 'class-validator';
import { CastToOptions, castTo } from './cast-to';
import { MUUID as UUIDv4, from as uuidV4From } from 'uuid-mongodb';
import { Binary } from 'mongodb';

export type CastToUUIDv4 = {
  v?: '4';
};

export type CastToUUIDv4Options = CastToOptions<UUIDv4> & CastToUUIDv4;
export type CastToUUIDv4ArrayOptions = CastToOptions<UUIDv4[]> & CastToUUIDv4;

export function castToUUIDv4(value: any, options: CastToUUIDv4Options = {}) {
  return castTo(value, false, castToUUIDv4Fn, options, { ...options });
}

export function castToUUIDv4Array(value: any, options: CastToUUIDv4ArrayOptions = {}) {
  return castTo(value, true, castToUUIDv4Fn, options, { ...options });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function castToUUIDv4Fn(value: any, options: CastToUUIDv4 = {}) {
  let newValue: UUIDv4;
  if (typeof value === 'string' && isUUID(value, '4')) {
    newValue = uuidV4From(value);
  } else if (typeof value === 'object' && value instanceof Binary) {
    newValue = uuidV4From(value);
  } else {
    throw new Error('Cast to uuid v4 error');
  }
  return newValue;
}
