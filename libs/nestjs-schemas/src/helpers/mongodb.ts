import * as mongoose from 'mongoose';
import { MUUID, from, v4 } from 'uuid-mongodb';
import { Binary } from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export import ObjectId = mongoose.Types.ObjectId;

export type UUIDv4 = MUUID;
export { from as stringToUUIDv4, from as binaryToUUIDv4, from as toUUIDv4 };

export { Binary };

export function generateObjectId(): ObjectId {
  return new ObjectId();
}

export function generateUUIDv4(): UUIDv4 {
  return v4();
}
