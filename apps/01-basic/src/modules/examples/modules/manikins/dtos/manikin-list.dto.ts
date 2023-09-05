import {
  $OmitType,
  $PropInstanceArray,
  $PropSubSchema,
  $PropSubSchemaArray,
  $Schema,
} from '@wandu/nestjs-schemas';
import { ManikinDto } from './manikin.dto';
import { DUMMIES_COLLECTION, DUMMY_PK, DummyDto } from '../../dummies';
import { ManikinLegFull } from '../schemas';
import { LEGS_COLLECTION, LEG_PK, LegDto } from '../../legs';

@$Schema()
export class ManikinListDto extends $OmitType(ManikinDto, [
  'dummyId',
  'legs',
] as const) {
  @$PropSubSchema(DummyDto, {
    lookup: {
      from: DUMMIES_COLLECTION,
      localField: 'dummyId',
      foreignField: DUMMY_PK,
    },
  })
  dummy!: DummyDto;

  @$PropInstanceArray(ManikinLegFull)
  legs!: ManikinLegFull;
}
