import { faker } from '@faker-js/faker';
import { generateUUIDv4, toPOJO } from '@wandu/nestjs-schemas';
import { Leg } from '../../schemas';
import { CreateLegDto, UpdateLegDto } from '../../dtos';
import { legMock } from '../mocks';
import { plainToInstance } from 'class-transformer';

export const legStub = (): Leg => {
  return legMock({
    id: generateUUIDv4(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });
};

export const createLegStub = (): CreateLegDto => {
  return plainToInstance(CreateLegDto, toPOJO(legStub()), {
    excludePrefixes: ['_', '__'],
    exposeUnsetFields: true,
    excludeExtraneousValues: true,
  });
};

export const updateLegStub = (): UpdateLegDto => {
  return plainToInstance(UpdateLegDto, toPOJO(legStub()), {
    excludePrefixes: ['_', '__'],
    exposeUnsetFields: true,
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });
};
