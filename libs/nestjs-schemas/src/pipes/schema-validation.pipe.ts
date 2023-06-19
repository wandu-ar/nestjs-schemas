import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { MetadataService } from '../metadata.service';
import { SchemaValidationFn } from '../types';
import { METADATA } from '../constants';

@Injectable()
export class SchemaValidationPipe implements PipeTransform<any> {
  constructor(
    private readonly _metadata: MetadataService, //
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.metatype && this._metadata.schemaExists(metadata.metatype)) {
      const validationFn = this._metadata.getMetadata<SchemaValidationFn>(
        METADATA.INTEGRITY_VALIDATION,
        metadata.metatype,
      );
      // run basic validation
      if (JSON.stringify(value) === '{}') {
        throw new BadRequestException(`Type ${metadata.type} is empty`);
      }

      // run custom validation
      if (validationFn) validationFn(value);
    }
    return value;
  }
}
