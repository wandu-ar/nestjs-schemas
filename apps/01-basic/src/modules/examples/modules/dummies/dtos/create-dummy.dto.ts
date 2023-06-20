import { Dummy } from '../schemas/dummy.schema';
import { $Schema, $OmitType, DEFAULT_ID_FIELD_NAME } from '@wandu-ar/nestjs-schemas';

@$Schema()
export class CreateDummyDto extends $OmitType(Dummy, [
  DEFAULT_ID_FIELD_NAME,
  'createdAt',
  'updatedAt',
]) {}
