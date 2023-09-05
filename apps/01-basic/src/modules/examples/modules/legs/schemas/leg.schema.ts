import { SchemaFactory } from '@nestjs/mongoose';
import {
  $PropBoolean,
  $PropDate,
  $PropNumberOptional,
  $PropObjectId,
  $PropString,
  $PropUUIDv4,
  $Schema,
  DEFAULT_ID_FIELD_NAME,
  ObjectId,
  UUIDv4,
} from '@wandu/nestjs-schemas';
import { HydratedDocument } from 'mongoose';
import { DUMMIES_COLLECTION } from '../../dummies';

export type LegDocument = HydratedDocument<Leg>;

export const LEGS_COLLECTION = 'legs';

export const LEG_PK: typeof DEFAULT_ID_FIELD_NAME & keyof Leg =
  DEFAULT_ID_FIELD_NAME;

@$Schema({
  mongoose: {
    collection: LEGS_COLLECTION,
    timestamps: true,
  },
})
export class Leg {
  @$PropUUIDv4()
  id!: UUIDv4;

  @$PropString()
  stringExample!: string;

  @$PropDate()
  createdAt!: Date;

  @$PropDate()
  updatedAt!: Date;
}

export const LEG_SCHEMA = Leg.name;
const LegSchema = SchemaFactory.createForClass(Leg);
LegSchema.index({ id: 1 }, { unique: true });
LegSchema.index({ createdAt: 1 });
export { LegSchema };
