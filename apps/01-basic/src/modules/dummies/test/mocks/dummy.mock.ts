import { factory } from 'fakingoose';
import { Dummy, DummyDocument, DummySchema } from '../../schemas';
import { FactoryOptions } from 'fakingoose/dist/types';

// @see https://github.com/faboulaws/fakingoose#usage
export const dummyMockFactoryOptions: FactoryOptions<DummyDocument> = {};

export const dummyMockFactory = (options = dummyMockFactoryOptions) =>
  factory(DummySchema, options);

export const dummyMock = (staticFields?: Dummy, overrideOptions?: FactoryOptions<Dummy>): Dummy => {
  const dummyDocument = dummyMockFactory().generate(<any>(<unknown>staticFields), overrideOptions);
  // Other overrides
  //return dummyDocument;
  // TODO: reparar
  return <Dummy>{};
};
