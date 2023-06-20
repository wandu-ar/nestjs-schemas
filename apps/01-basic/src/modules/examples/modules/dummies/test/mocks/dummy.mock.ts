import { factory } from 'fakingoose';
import { Dummy, DummyDocument, DummySchema } from '../../schemas';
import { FactoryOptions } from 'fakingoose/dist/types';

// @see https://github.com/faboulaws/fakingoose#usage
export const dummyMockFactoryOptions: FactoryOptions<DummyDocument> = {};

export const dummyMockFactory = (options = dummyMockFactoryOptions) =>
  factory(DummySchema, options);

export const dummyMock = (
  staticFields?: Partial<Dummy>,
  overrideOptions?: FactoryOptions<Dummy>,
): Dummy => {
  const dummyDocument = dummyMockFactory({
    _id: { skip: true },
    __v: { skip: true },
  }).generate(staticFields, overrideOptions);
  // Other overrides
  //console.log(dummyDocument);
  return dummyDocument;
};
