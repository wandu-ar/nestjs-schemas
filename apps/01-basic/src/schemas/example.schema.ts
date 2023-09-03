import {
  $PropDateOptional,
  $PropInstance,
  $PropString,
  $PropStringOptional,
  $Schema,
} from '@wandu/nestjs-schemas';
import { ContactInfo } from './contact-info-schema';

@$Schema()
export class Example {
  @$PropString()
  fullname!: string;

  @$PropInstance(ContactInfo)
  contactInfo!: ContactInfo;

  @$PropStringOptional()
  gender!: string | null;

  @$PropDateOptional()
  birthday!: Date | null;

  @$PropStringOptional()
  nationality!: string | null;
}
