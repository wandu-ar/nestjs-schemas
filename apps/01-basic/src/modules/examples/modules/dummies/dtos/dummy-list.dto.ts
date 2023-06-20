import { $Schema } from '@wandu-ar/nestjs-schemas';
import { DummyDto } from './dummy.dto';

@$Schema()
export class DummyListDto extends DummyDto {}
