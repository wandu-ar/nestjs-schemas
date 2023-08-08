import { $Schema, $PropStringOptional, $PropNumberOptional } from '@wandu/nestjs-schemas';

@$Schema()
export class Address {
  @$PropStringOptional({ isEmail: true })
  street: string | null = null;

  @$PropNumberOptional()
  door: number | null = null;
}
