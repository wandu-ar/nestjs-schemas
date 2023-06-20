import { Manikin } from '../schemas/manikin.schema';
import { $Schema, $OmitType, DEFAULT_ID_FIELD_NAME } from '@wandu-ar/nestjs-schemas';

@$Schema()
export class CreateManikinDto extends $OmitType(Manikin, [
  DEFAULT_ID_FIELD_NAME,
  'createdAt',
  'updatedAt',
]) {}
