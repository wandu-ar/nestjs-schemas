import { faker } from '@faker-js/faker';
import { generateUUIDv4, toPOJO } from '@wandu/nestjs-schemas';
import { Dummy } from '../../schemas';
import { CreateDummyDto, UpdateDummyDto } from '../../dtos';
import { dummyMock } from '../mocks';
import { plainToInstance } from 'class-transformer';

export const dummyStub = (): Dummy => {
  return dummyMock({
    id: generateUUIDv4(),
    dateExample: faker.date.anytime(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });
};

export const createDummyStub = (): CreateDummyDto => {
  return plainToInstance(CreateDummyDto, toPOJO(dummyStub()), {
    excludePrefixes: ['_', '__'],
    exposeUnsetFields: true,
    excludeExtraneousValues: true,
  });
};

export const updateDummyStub = (): UpdateDummyDto => {
  return plainToInstance(UpdateDummyDto, toPOJO(dummyStub()), {
    excludePrefixes: ['_', '__'],
    exposeUnsetFields: true,
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });
};
