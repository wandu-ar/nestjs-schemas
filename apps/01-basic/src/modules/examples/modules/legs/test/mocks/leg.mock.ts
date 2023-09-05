import { factory } from 'fakingoose';
import { Leg, LegDocument, LegSchema } from '../../schemas';
import { FactoryOptions } from 'fakingoose/dist/types';

// @see https://github.com/faboulaws/fakingoose#usage
export const legMockFactoryOptions: FactoryOptions<LegDocument> = {};

export const legMockFactory = (options = legMockFactoryOptions) =>
  factory(LegSchema, options);

export const legMock = (
  staticFields?: Partial<Leg>,
  overrideOptions?: FactoryOptions<Leg>,
): Leg => {
  const legDocument = legMockFactory({
    _id: { skip: true },
    __v: { skip: true },
  }).generate(staticFields, overrideOptions);
  // Other overrides
  //console.log(legDocument);
  return legDocument;
};
