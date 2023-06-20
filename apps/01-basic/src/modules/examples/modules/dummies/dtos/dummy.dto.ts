import { $Schema } from '@wandu/nestjs-schemas';
import { Dummy } from '../schemas/dummy.schema';

@$Schema()
export class DummyDto extends Dummy {}
