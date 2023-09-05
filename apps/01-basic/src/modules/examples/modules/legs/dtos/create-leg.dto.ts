import { Leg } from '../schemas/leg.schema';
import { $Schema, $OmitType, DEFAULT_ID_FIELD_NAME } from '@wandu/nestjs-schemas';

@$Schema()
export class CreateLegDto extends $OmitType(Leg, [
  DEFAULT_ID_FIELD_NAME,
  'createdAt',
  'updatedAt',
]) {}
