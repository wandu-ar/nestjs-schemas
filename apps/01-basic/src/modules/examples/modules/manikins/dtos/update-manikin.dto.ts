import { $PartialType, $Schema } from '@wandu/nestjs-schemas';
import { CreateManikinDto } from './create-manikin.dto';

@$Schema()
export class UpdateManikinDto extends $PartialType(CreateManikinDto) {}
