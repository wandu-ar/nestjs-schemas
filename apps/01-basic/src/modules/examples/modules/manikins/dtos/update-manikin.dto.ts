import { $PartialType, $Schema } from '@wandu/nestjs-schemas';
import { CreateManikinDto } from './create-manikin.dto';

@$Schema()
export class UpdateManikinDto extends $PartialType(CreateManikinDto) {
  constructor() {
    super();
    // Make all default values on partial as undefined
    // This prevent expose default values when input body is partial
    const o: any = <unknown>this;
    for (const k in o) o[k] = undefined;
  }
}
