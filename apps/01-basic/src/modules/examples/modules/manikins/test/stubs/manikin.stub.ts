import { faker } from '@faker-js/faker';
import { generateUUIDv4, toPOJO } from '@wandu-ar/nestjs-schemas';
import { Manikin } from '../../schemas';
import { CreateManikinDto, UpdateManikinDto } from '../../dtos';
import { manikinMock } from '../mocks';
import { plainToInstance } from 'class-transformer';

export const manikinStub = (): Manikin => {
  return manikinMock({
    id: generateUUIDv4(),
    dummy: generateUUIDv4(),
    dateExample: faker.date.anytime(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });
};

export const createManikinStub = (): CreateManikinDto => {
  return plainToInstance(CreateManikinDto, toPOJO(manikinStub()), {
    excludePrefixes: ['_', '__'],
    exposeUnsetFields: true,
    excludeExtraneousValues: true,
  });
};

export const updateManikinStub = (): UpdateManikinDto => {
  return plainToInstance(UpdateManikinDto, toPOJO(manikinStub()), {
    excludePrefixes: ['_', '__'],
    exposeUnsetFields: true,
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });
};
