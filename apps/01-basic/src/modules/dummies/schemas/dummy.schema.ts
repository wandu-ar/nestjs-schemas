import { SchemaFactory } from '@nestjs/mongoose';
import {
  $PropBoolean,
  $PropDate,
  $PropNumber,
  $PropObjectId,
  $PropString,
  $PropUUIDv4,
  $Schema,
  ObjectId,
  UUIDv4,
} from '@wandu-ar/nestjs-schemas';
import { HydratedDocument } from 'mongoose';

export type DummyDocument = HydratedDocument<Dummy>;

export const DUMMIES_COLLECTION = 'dummies';

export const DUMMY_PK: 'id' & keyof Dummy = 'id';

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

  @$PropBoolean()
  booleanExample!: boolean;

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
