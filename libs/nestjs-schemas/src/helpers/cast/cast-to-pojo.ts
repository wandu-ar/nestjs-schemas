import { CastToOptions, castTo } from './cast-to';

//export type CastToPojo = {};

export type CastToPojoOptions = CastToOptions<object> /* & CastToPojo*/;
export type CastToPojoArrayOptions = CastToOptions<object[]> /* & CastToPojo*/;

export function castToPojo(value: any, options: CastToPojoOptions = {}) {
  return castTo(value, false, castToPojoFn, options, { ...options });
}

export function castToPojoArray(value: any, options: CastToPojoArrayOptions = {}) {
  return castTo(value, true, castToPojoFn, options, { ...options });
}

export function castToPojoFn(value: any /*, options: CastToPojo = {}*/): object {
  let newValue: object;
  if (typeof value === 'object') {
    // clean object
    newValue = JSON.parse(JSON.stringify(value));
  } else if (typeof value === 'string') {
    newValue = JSON.parse(value.trim());
  } else {
    throw new Error('Cast to pojo error');
  }

  if (typeof newValue !== 'object' || !newValue) throw new Error('Cast to pojo error');

  return newValue;
}
