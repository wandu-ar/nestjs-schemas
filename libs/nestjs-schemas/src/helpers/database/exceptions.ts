export class DBException extends Error {
  constructor(message = '', private readonly errors?: any) {
    super(`Database exception${message ? `: ${message}` : '.'}'`);
  }
  getErrors(): any {
    return this.errors;
  }
}

export class DBUnknownException extends DBException {
  constructor(msg?: any) {
    super(msg);
  }
}

export class DBDuplicatedKeyException extends DBException {
  constructor(errors?: any) {
    super('Duplicated key exception', errors);
  }
}
