import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { from as UUIDv4From } from 'uuid-mongodb';
import { UUIDv4 } from '../helpers';

@Injectable()
export class ParseUUIDv4Pipe implements PipeTransform<string, UUIDv4> {
  transform(value: string): UUIDv4 {
    if (isUUID(value, '4')) return UUIDv4From(value);
    throw new BadRequestException('INVALID_UUID_FORMAT');
  }
}
