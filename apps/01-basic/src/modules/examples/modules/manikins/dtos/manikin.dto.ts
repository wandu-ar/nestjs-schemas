import { $Schema } from '@wandu/nestjs-schemas';
import { Manikin } from '../schemas/manikin.schema';

@$Schema()
export class ManikinDto extends Manikin {}
