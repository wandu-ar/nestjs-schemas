import { $Schema } from '@wandu/nestjs-schemas';
import { DummyDto } from './dummy.dto';

@$Schema()
export class DummyListDto extends DummyDto {}
