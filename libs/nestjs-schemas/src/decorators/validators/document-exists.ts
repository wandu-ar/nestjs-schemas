import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DatabaseService } from '../../database.service';
import { ModuleSettings } from '../../interfaces';
import { ObjectId } from '../../helpers';
import { MODULE_OPTIONS_TOKEN } from '../../schemas.module-definition';

/**
 * Verificar la existencia de un documento de mongo mediante su id
 *
 * @autor Alejandro D. Guevara <alejandro@wandu.ar>
 */
@ValidatorConstraint({ name: 'documentExists', async: true })
@Injectable()
export class DocumentExistsValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private _settings: ModuleSettings,
    private readonly _database: DatabaseService,
  ) {
    Logger.debug('DocumentExistsValidator from SchemasModule has been loaded.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: ObjectId, args: ValidationArguments) {
    throw new InternalServerErrorException('NOT_IMPLEMENTED_YET');
    if (this._settings.nodeEnv === 'test' && this._settings.skipDocumentExistsValidatorInTest) {
      return true;
    }
    const [collection] = args.constraints;
    try {
      const conn = this._database.getConnection();
      const doc = await conn
        .collection(collection)
        .findOne({ _id: value }, { projection: { _id: true } }); // TODO: Pasar a config

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
