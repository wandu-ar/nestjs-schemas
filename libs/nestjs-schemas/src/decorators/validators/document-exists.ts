import { Inject, Injectable, Logger } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ModuleRef } from '@nestjs/core';
import { Connection } from 'mongoose';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ModuleSettings } from '../../interfaces';
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
    @Inject(MODULE_OPTIONS_TOKEN) private readonly _settings: ModuleSettings, //private readonly _database: DatabaseService,
    private readonly _moduleRef: ModuleRef,
  ) {
    Logger.debug('DocumentExistsValidator from SchemasModule has been loaded.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: any, args: ValidationArguments) {
    if (this._settings.nodeEnv === 'test' && this._settings.skipDocumentExistsValidatorInTest) {
      return true;
    }
    try {
      const opts = this.getOpts(args);
      const connToken = getConnectionToken(opts.connectionName);
      const conn = this._moduleRef.get<Connection>(connToken);
      const doc = await conn
        .collection(opts.collection)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .findOne({ [opts.field!]: value }, { projection: { _id: true } });
      return doc !== null;
    } catch (err) {
      Logger.error(`Error in "DocumentExistsRule" validator with opts ${args.constraints}`);
      Logger.error(err);
      return false;
    }
  }

  getOpts(args: ValidationArguments): DocumentExistsOpts {
    const [opts] = <DocumentExistsOpts[]>args.constraints;
    if (typeof opts === 'string') {
      return {
        collection: opts,
        connectionName: undefined,
        field: 'id',
      };
    } else {
      return {
        collection: opts.collection,
        connectionName: opts.connectionName,
        field: opts.field ?? 'id',
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    const [collection] = args.constraints;
    return `Document not found in ${collection} collection.`;
  }
}

export function DocumentExists(
  opts: string | DocumentExistsOpts,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: any, propertyName: any) {
    registerDecorator({
      name: 'documentExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [opts],
      validator: DocumentExistsValidator,
      async: true,
    });
  };
}

export type DocumentExistsOpts = {
  collection: string;
  connectionName?: string;
  field?: string;
};
