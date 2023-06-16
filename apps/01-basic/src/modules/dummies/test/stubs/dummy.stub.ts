import { faker } from '@faker-js/faker';
//import { ObjectId } from '@wandu-ar/nestjs-schemas';
import { v4 } from 'uuid-mongodb';
import { Dummy } from '../../schemas';
import { CreateDummyDto, UpdateDummyDto } from '../../dtos';

export const dummyStub = (): Dummy => ({
  id: v4(),
  text: faker.string.sample(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const createDummyStub = (): CreateDummyDto => ({
  text: faker.string.sample(),
});

export const updateDummyStub = (): UpdateDummyDto => ({
  text: faker.string.sample(),
});
