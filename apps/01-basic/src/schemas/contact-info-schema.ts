import { $Schema, $PropStringOptional, $PropInstanceArrayOptional } from '@wandu/nestjs-schemas';
import { StreetOfAddress } from './street-of-address';

@$Schema()
export class ContactInfo {
  @$PropStringOptional({ isEmail: true })
  email: string | null = null;

  @$PropStringOptional()
  mobilePhone: string | null = null;

  @$PropStringOptional()
  legacyAddress: string | null = null;

  @$PropInstanceArrayOptional(StreetOfAddress)
  addresses: StreetOfAddress[] | null = null;
}
