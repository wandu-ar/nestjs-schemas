export type CommonCastOptions = {
  nullString?: boolean;
  undefinedString?: boolean;
};

export function checkNullOrUndefinedString(value: any, options: CommonCastOptions = {}) {
  if (typeof value === 'string') {
    if (options.nullString && value.trim() === 'null') return null;
    if (options.undefinedString && value.trim() === 'undefined') return undefined;
  }
  return value;
}
