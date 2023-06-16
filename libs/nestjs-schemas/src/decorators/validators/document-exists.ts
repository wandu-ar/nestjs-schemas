import { Injectable, Logger } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ObjectId } from '../../types';
import { DatabaseService } from '../../database.service';

/**
 * Verificar la existencia de un documento de mongo mediante su id
 *
 * @autor Alejandro D. Guevara <alejandro@wandu.ar>
 */
@ValidatorConstraint({ name: 'documentExists', async: true })
@Injectable()
export class DocumentExistsValidator implements ValidatorConstraintInterface {
  constructor(
    // private readonly _config: ConfigService,
    private readonly _database: DatabaseService,
  ) {
    Logger.debug('DocumentExistsValidator from NestjsSchemasModule has been loaded.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: ObjectId, args: ValidationArguments) {
    // if (this._config.getOrThrow<string>('NODE_ENV') === 'test') {
    //   return true;
    // }
    const [collection] = args.constraints;
    try {
      const conn = this._database.getConnection();
      const doc = await conn
        .collection(collection)
        .findOne({ _id: value }, { projection: { _id: true } });

      return doc !== null;
    } catch (err) {
      Logger.error(
        `Error on find document in collection ${collection} by "DocumentExistsRule" validator.`,
      );
      Logger.error(err);
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    const [collection] = args.constraints;
    return `Document not found in ${collection} collection.`;
  }
}

export function DocumentExists(
  collection: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: any, propertyName: any) {
    registerDecorator({
      name: 'documentExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [collection],
      validator: DocumentExistsValidator,
      async: true,
    });
  };
}
