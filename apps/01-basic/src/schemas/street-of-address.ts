import { $OmitType, $Schema } from '@wandu/nestjs-schemas';
import { Address } from './address.schema';

@$Schema()
export class StreetOfAddress extends $OmitType(Address, ['door'] as const) {}
