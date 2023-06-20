import { $OmitType, $PropSubSchema, $Schema } from '@wandu-ar/nestjs-schemas';
import { ManikinDto } from './manikin.dto';
import { DUMMIES_COLLECTION, DummyDto } from '../../dummies';

@$Schema()
export class ManikinListDto extends $OmitType(ManikinDto, ['dummyId'] as const) {
  @$PropSubSchema(DummyDto, { lookup: DUMMIES_COLLECTION })
  dummy!: DummyDto;
}
