import {
  $PropDate,
  $PropString,
  $PropUUIDv4,
  $Schema,
  UUIDv4,
} from '@wandu/nestjs-schemas';
import { LEGS_COLLECTION } from '../../legs';

@$Schema()
export class ManikinLeg {
  @$PropString()
  someText!: string;

  @$PropUUIDv4({ ref: LEGS_COLLECTION, mustExists: true })
  legId!: UUIDv4;

  @$PropDate()
  createdAt!: Date;
}
