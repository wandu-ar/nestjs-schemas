import { $PartialType, $Schema } from '@wandu/nestjs-schemas';
import { CreateDummyDto } from './create-dummy.dto';

@$Schema()
export class UpdateDummyDto extends $PartialType(CreateDummyDto) {
  constructor() {
    super();
    // Make all default values on partial as undefined
    // This prevent expose default values when input body is partial
    const o: any = <unknown>this;
    for (const k in o) o[k] = undefined;
  }
}
