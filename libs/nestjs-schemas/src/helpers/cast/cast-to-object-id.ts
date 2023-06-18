import { ObjectId } from '../mongodb';
import { CastToOptions, castTo } from './cast-to';

//export type CastToObjectId = {};

export type CastToObjectIdOptions = CastToOptions<ObjectId> /* & CastToObjectId*/;

export type CastToObjectIdArrayOptions = CastToOptions<ObjectId[]> /* & CastToObjectId*/;

export function castToObjectId(value: any, options: CastToObjectIdOptions = {}) {
  return castTo(value, false, castToObjectIdFn, options, { ...options });
}

export function castToObjectIdArray(value: any, options: CastToObjectIdArrayOptions = {}) {
  return castTo(value, true, castToObjectIdFn, options, { ...options });
}

export function castToObjectIdFn(value: any /*, options: CastToObjectId = {}*/) {
  let newValue: ObjectId;
  if (ObjectId.isValid(value)) {
    newValue = new ObjectId(value);
  } else {
    throw new Error('Cast to object id error');
  }
  return newValue;
}
