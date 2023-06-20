import { $PartialType, $Schema } from '@wandu/nestjs-schemas';
import { CreateDummyDto } from './create-dummy.dto';

@$Schema()
export class UpdateDummyDto extends $PartialType(CreateDummyDto) {}
