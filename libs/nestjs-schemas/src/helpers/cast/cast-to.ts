export type CastToOptions<T> = {
  default?: T | null;
  nullString?: boolean;
  undefinedString?: boolean;
};

export function castTo<T, CastFnOptions = undefined>(
  value: any,
  mustBeArray: false,
  castFn: (value: any, options?: CastFnOptions) => T,
  castFnOptions: CastFnOptions,
  castToOptions: CastToOptions<T>,
): T | null;
export function castTo<T, CastFnOptions = undefined>(
  value: any,
  mustBeArray: true,
  castFn: (value: any, options?: CastFnOptions) => T,
  castFnOptions: CastFnOptions,
  castToOptions: CastToOptions<T[]>,
): T[] | null;
export function castTo<T, CastFnOptions = undefined>(
  value: any,
  mustBeArray: boolean,
  castFn: (value: any, options?: CastFnOptions) => T,
  castFnOptions: CastFnOptions,
  castToOptions: CastToOptions<T>,
): T | T[] | null {
  castToOptions.default = castToOptions.default ?? null;
  value = checkNullOrUndefinedString(value, castToOptions);
  value = !mustBeArray || Array.isArray(value) ? value : undefined;
  let newValue: T | T[] | null;
  if (value !== null && value !== undefined) {
    try {
      if (!mustBeArray) {
        newValue = castFn(value, castFnOptions);
      } else {
        newValue = [];
        for (const element of value) {
          newValue.push(castFn(element, castFnOptions));
        }
      }
    } catch (_) {
      newValue = castToOptions.default;
    }
  } else {
    newValue = castToOptions.default;
  }
  return newValue;
}

function checkNullOrUndefinedString(value: any, options: CastToOptions<any> = {}) {
  if (typeof value === 'string') {
    if (options.nullString && value.trim() === 'null') return null;
    if (options.undefinedString && value.trim() === 'undefined') return undefined;
  }
  return value;
}
