import { FormItemKindEnum } from '@wandu/nestjs-dynamic-forms';
import {
  $Schema,
  $PropStringOptional,
  $PropNumberOptional,
} from '@wandu/nestjs-schemas';

@$Schema()
export class Address {
  @$PropStringOptional({
    isEmail: true,
  })
  street!: string | null;

  @$PropNumberOptional()
  door!: number | null;
}
