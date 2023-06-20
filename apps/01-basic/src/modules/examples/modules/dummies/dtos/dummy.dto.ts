import { $Schema } from '@wandu-ar/nestjs-schemas';
import { Dummy } from '../schemas/dummy.schema';

@$Schema()
export class DummyDto extends Dummy {}
