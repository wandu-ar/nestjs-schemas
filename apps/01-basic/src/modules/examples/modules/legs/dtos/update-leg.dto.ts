import { $PartialType, $Schema } from '@wandu/nestjs-schemas';
import { CreateLegDto } from './create-leg.dto';

@$Schema()
export class UpdateLegDto extends $PartialType(CreateLegDto) {
  constructor() {
    super();
    // Make all default values on partial as undefined
    // This prevent expose default values when input body is partial
    const o: any = <unknown>this;
    for (const k in o) o[k] = undefined;
  }
}
