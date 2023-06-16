import { Dummy } from '../schemas/dummy.schema';
import { $Schema, $OmitType } from '@wandu-ar/nestjs-schemas';

@$Schema()
export class CreateDummyDto extends $OmitType(Dummy, ['id', 'createdAt', 'updatedAt']) {}
