import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from '../types';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, ObjectId> {
  transform(value: string): ObjectId {
    const validObjectId = ObjectId.isValid(value);
    if (!validObjectId) {
      throw new BadRequestException('INVALID_OBJECT_ID_FORMAT');
    }
    return new ObjectId(value);
  }
}
