import { factory } from 'fakingoose';
import { Manikin, ManikinDocument, ManikinSchema } from '../../schemas';
import { FactoryOptions } from 'fakingoose/dist/types';

// @see https://github.com/faboulaws/fakingoose#usage
export const manikinMockFactoryOptions: FactoryOptions<ManikinDocument> = {};

export const manikinMockFactory = (options = manikinMockFactoryOptions) =>
  factory(ManikinSchema, options);

export const manikinMock = (
  staticFields?: Partial<Manikin>,
  overrideOptions?: FactoryOptions<Manikin>,
): Manikin => {
  const manikinDocument = manikinMockFactory({
    _id: { skip: true },
    __v: { skip: true },
  }).generate(staticFields, overrideOptions);
  // Other overrides
  //console.log(manikinDocument);
  return manikinDocument;
};
