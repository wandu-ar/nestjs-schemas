import { CastToOptions, castTo } from './cast-to';

export type CastToString = {
  trim?: boolean;
  case?: 'upperCase' | 'lowerCase';
};

export type CastToStringOptions = CastToOptions<string> & CastToString;
export type CastToStringArrayOptions = CastToOptions<string[]> & CastToString;

export function castToString(value: any, options: CastToStringOptions = {}) {
  return castTo(value, false, castToStringFn, options, { ...options });
}

export function castToStringArray(value: any, options: CastToStringArrayOptions = {}) {
  return castTo(value, true, castToStringFn, options, { ...options });
}

// TODO: Add more case opts as https://github.com/techniboogie-dart/recase/blob/master/lib/recase.dart
export function castToStringFn(value: any, options: CastToString = {}) {
  let newValue: string;
  if (typeof value === 'string') {
    newValue = value;
  } else {
    if (typeof value['toString'] === 'function') {
      newValue = value.toString();
      if (newValue === '[object Object]') {
        newValue = JSON.stringify(value);
      }
    } else {
      newValue = String(value);
    }
  }

  // Apply type transformation
  if (options.trim ?? true) {
    newValue = newValue?.trim();
  }

  if (options.case) {
    switch (options.case) {
      case 'upperCase':
        newValue = newValue?.toUpperCase();
        break;
      case 'lowerCase':
        newValue = newValue?.toLowerCase();
        break;
    }
  }

  return newValue;
}
