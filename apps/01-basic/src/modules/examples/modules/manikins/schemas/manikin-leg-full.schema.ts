import { $OmitType, $PropSubSchema, $Schema } from '@wandu/nestjs-schemas';
import { LEGS_COLLECTION, LEG_PK, LegDto } from '../../legs';
import { ManikinLeg } from './manikin-leg.schema';

@$Schema()
export class ManikinLegFull extends $OmitType(ManikinLeg, ['legId'] as const) {
  @$PropSubSchema(LegDto, {
    lookup: {
      from: LEGS_COLLECTION,
      localField: 'legId',
      foreignField: LEG_PK,
    },
  })
  leg!: LegDto;
}
