import { $OmitType, $PropStringOptional, $Schema } from '@wandu/nestjs-schemas';
import { Example } from './example.schema';

@$Schema()
export class ExampleInList extends $OmitType(Example, [
  'contactInfo',
] as const) {
  @$PropStringOptional()
  notes!: string | null;
}
