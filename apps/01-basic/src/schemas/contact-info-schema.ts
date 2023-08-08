import { $Schema, $PropStringOptional, $PropInstanceArrayOptional } from '@wandu/nestjs-schemas';
import { Address } from './address.schema';

@$Schema()
export class ContactInfo {
  @$PropStringOptional({ isEmail: true })
  email: string | null = null;

  @$PropStringOptional()
  mobilePhone: string | null = null;

  @$PropStringOptional()
  legacyAddress: string | null = null;

  @$PropInstanceArrayOptional(Address)
  addresses: Address[] | null = null;
}
