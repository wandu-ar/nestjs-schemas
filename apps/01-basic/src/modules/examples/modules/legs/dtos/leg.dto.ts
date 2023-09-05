import { $Schema } from '@wandu/nestjs-schemas';
import { Leg } from '../schemas/leg.schema';

@$Schema()
export class LegDto extends Leg {}
