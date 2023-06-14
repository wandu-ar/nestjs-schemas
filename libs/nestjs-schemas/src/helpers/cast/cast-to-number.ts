import { CastToOptions, castTo } from './cast-to';

export type CastToNumber = {
  round?: 'round' | 'floor' | 'ceil' | 'trunc';
  fixed?: number;
  isArray?: boolean;
};

export type CastToNumberOptions = CastToOptions<number> & CastToNumber;

export type CastToNumberArrayOptions = CastToOptions<number[]> & CastToNumber;

export function castToNumber(value: any, options: CastToNumberOptions = {}) {
  return castTo(value, false, castToNumberFn, options, { ...options });
}

export function castToNumberArray(value: any, options: CastToNumberArrayOptions = {}) {
  return castTo(value, true, castToNumberFn, options, { ...options });
}

export function castToNumberFn(value: any, options: CastToNumber = {}) {
  let newValue: number;
  if (typeof value === 'number') {
    newValue = value;
  } else {
    newValue = Number(value);
    if (Number.isNaN(newValue) || !Number.isFinite(newValue))
      throw new Error('Cast to number error');
  }

  // Apply type transformation
  if (options.round) {
    switch (options.round) {
      case 'round':
        newValue = Math.round(newValue);
        break;
      case 'floor':
        newValue = Math.floor(newValue);
        break;
      case 'ceil':
        newValue = Math.ceil(newValue);
        break;
      case 'trunc':
        newValue = Math.trunc(newValue);
        break;
    }
  }

  if (options.fixed) {
    newValue = Number(newValue?.toFixed(options.fixed));
  }

  return newValue;
}
