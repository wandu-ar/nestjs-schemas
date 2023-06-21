import { SchemaFactory } from '@nestjs/mongoose';
import {
  $PropBoolean,
  $PropBooleanOptional,
  $PropDate,
  $PropNumber,
  $PropObjectId,
  $PropString,
  $PropUUIDv4,
  $Schema,
  DEFAULT_ID_FIELD_NAME,
  ObjectId,
  UUIDv4,
} from '@wandu/nestjs-schemas';
import { HydratedDocument } from 'mongoose';

export type DummyDocument = HydratedDocument<Dummy>;

export const DUMMIES_COLLECTION = 'dummies';

export const DUMMY_PK: typeof DEFAULT_ID_FIELD_NAME & keyof Dummy = DEFAULT_ID_FIELD_NAME;

@$Schema({
  mongoose: {
    collection: DUMMIES_COLLECTION,
    timestamps: true,
  },
})
export class Dummy {
  @$PropUUIDv4()
  id!: UUIDv4;

  @$PropString()
  stringExample!: string;

  @$PropNumber()
  numberExample!: number;

  @$PropBooleanOptional()
  booleanExample: boolean | null = null;

  @$PropDate()
  dateExample!: Date;

  @$PropObjectId()
  objectIdExample!: ObjectId;

  @$PropDate()
  createdAt!: Date;

  @$PropDate()
  updatedAt!: Date;
}

export const DUMMY_SCHEMA = Dummy.name;
const DummySchema = SchemaFactory.createForClass(Dummy);
DummySchema.index({ id: 1 }, { unique: true });
DummySchema.index({ createdAt: 1 });
export { DummySchema };
