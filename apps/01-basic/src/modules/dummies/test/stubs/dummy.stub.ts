import { faker } from '@faker-js/faker';
import { v4 } from 'uuid-mongodb';
import { Dummy } from '../../schemas';
//import { ObjectId } from '@wandu-ar/nestjs-schemas';

export const dummyStub = (): Dummy => {
  return {
    //_id: new ObjectId(),
    id: v4(),
    text: faker.string.sample(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
};

export const updateDummyStub = (): Partial<Dummy> => {
  return {};
};
