import { SchemaFactory } from '@nestjs/mongoose';
import {
  $PropBoolean,
  $PropDate,
  $PropNumber,
  $PropObjectId,
  $PropString,
  $PropUUIDv4,
  $Schema,
  DEFAULT_ID_FIELD_NAME,
  ObjectId,
  UUIDv4,
} from '@wandu-ar/nestjs-schemas';
import { HydratedDocument } from 'mongoose';
import { DUMMIES_COLLECTION } from '../../dummies';

export type ManikinDocument = HydratedDocument<Manikin>;

export const MANIKINS_COLLECTION = 'manikins';

export const MANIKIN_PK: typeof DEFAULT_ID_FIELD_NAME & keyof Manikin = DEFAULT_ID_FIELD_NAME;

@$Schema({
  mongoose: {
    collection: MANIKINS_COLLECTION,
    timestamps: true,
  },
})
export class Manikin {
  @$PropUUIDv4()
  id!: UUIDv4;

  @$PropString()
  stringExample!: string;

  @$PropNumber()
  numberExample!: number;

  @$PropBoolean()
  booleanExample!: boolean;

  @$PropDate()
  dateExample!: Date;

  @$PropObjectId()
  objectIdExample!: ObjectId;

  @$PropUUIDv4({ ref: DUMMIES_COLLECTION, mustExists: true })
  dummy!: UUIDv4;

  @$PropDate()
  createdAt!: Date;

  @$PropDate()
  updatedAt!: Date;
}

export const MANIKIN_SCHEMA = Manikin.name;
const ManikinSchema = SchemaFactory.createForClass(Manikin);
ManikinSchema.index({ id: 1 }, { unique: true });
ManikinSchema.index({ createdAt: 1 });
export { ManikinSchema };
