import { SchemaFactory } from '@nestjs/mongoose';
import {
  $PropDateOptional,
  $PropString,
  $PropUUIDv4,
  $Schema,
  UUIDv4,
} from '@wandu-ar/nestjs-schemas';
import { HydratedDocument } from 'mongoose';

export type DummyDocument = HydratedDocument<Dummy>;

export const DUMMIES_COLLECTION = 'dummies';

export const DUMMY_PK: 'id' & keyof Dummy = 'id';

@$Schema({
  mongoose: {
    timestamps: true,
    collection: DUMMIES_COLLECTION,
  },
})
export class Dummy {
  @$PropUUIDv4()
  id!: UUIDv4;

  @$PropString()
  text!: string;

  @$PropDateOptional()
  createdAt: Date | null = null;

  @$PropDateOptional()
  updatedAt: Date | null = null;
}

export const DUMMY_SCHEMA = Dummy.name;
const DummySchema = SchemaFactory.createForClass(Dummy);
DummySchema.index({ id: 1 }, { unique: true });
DummySchema.index({ createdAt: 1 });
export { DummySchema };
