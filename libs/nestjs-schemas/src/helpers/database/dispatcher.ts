import { ValidationError } from '@nestjs/common';
import { DBDuplicatedKeyException, DBException, DBUnknownException } from './exceptions';

export class DatabaseHelper {
  static dispatchError(err: any): DBException {
    // Capturamos el error comun de cuando hay un valor duplicado cuyo indice es único
    if (err?.code === 11000) {
      const keys = Object.getOwnPropertyNames(err?.keyPattern || []);
      const errors: ValidationError[] = [];
      for (const key of keys) {
        errors.push({
          property: key,
          children: [],
          constraints: {
            isUnique: 'value must be unique',
          },
        });
      }

      return new DBDuplicatedKeyException(errors);
    }

    return new DBUnknownException(err);
  }
}
