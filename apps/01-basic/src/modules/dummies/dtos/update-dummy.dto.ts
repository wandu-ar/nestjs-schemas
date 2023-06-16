import { $PartialType, $Schema } from '@wandu-ar/nestjs-schemas';
import { CreateDummyDto } from './create-dummy.dto';

@$Schema()
export class UpdateDummyDto extends $PartialType(CreateDummyDto) {}
