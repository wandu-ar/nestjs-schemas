import * as dayjs from 'dayjs';
import { CastToOptions, castTo } from './cast-to';

//export type CastToDate = {};

export type CastToDateOptions = CastToOptions<Date> /* & CastToDate*/;

export type CastToDateArrayOptions = CastToOptions<Date[]> /* & CastToDate*/;

export function castToDate(value: any, options: CastToDateOptions = {}) {
  return castTo(value, false, castToDateFn, options, { ...options });
}

export function castToDateArray(value: any, options: CastToDateArrayOptions = {}) {
  return castTo(value, true, castToDateFn, options, { ...options });
}

export function castToDateFn(value: any /*, options: CastToDate = {}*/) {
  let newValue: Date;
  if (typeof value === 'object' && value instanceof Date) {
    newValue = value;
  } else {
    const dayjsDate = dayjs(value);
    if (!dayjsDate.isValid()) {
      throw new Error('Cast to date error');
    }
    newValue = dayjsDate.toDate();
  }
  return newValue;
}
