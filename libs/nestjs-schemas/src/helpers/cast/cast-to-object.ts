import { CastToOptions, castTo } from './cast-to';

//export type CastToObject = {};

export type CastToObjectOptions = CastToOptions<object> /* & CastToObject*/;
export type CastToObjectArrayOptions = CastToOptions<object[]> /* & CastToObject*/;

export function castToObject(value: any, options: CastToObjectOptions = {}) {
  return castTo(value, false, castToObjectFn, options, { ...options });
}

export function castToObjectArray(value: any, options: CastToObjectArrayOptions = {}) {
  return castTo(value, true, castToObjectFn, options, { ...options });
}

export function castToObjectFn(value: any /*, options: CastToObject = {}*/): object {
  let newValue: object;
  if (typeof value === 'object') {
    // clean object
    newValue = value;
  } else if (typeof value === 'string') {
    newValue = JSON.parse(value.trim());
  } else {
    throw new Error('Cast to object error');
  }

  if (typeof newValue !== 'object' || !newValue) throw new Error('Cast to object error');

  return newValue;
}
