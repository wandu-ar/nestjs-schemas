import { Schema } from 'mongoose';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsNumberOptions,
  IsInt,
  IsPositive,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import {
  CommonPropOpts,
  Nullable,
  PropCommonOpts,
  PropertyOptions,
} from '../../types';
import {
  CastToNumberArrayOptions,
  CastToNumberOptions,
  TransformToNumber,
  TransformToNumberArray,
} from '../../helpers';
import { DocumentExistsOpts } from '../validators';

type PropNumberCommonOpts = PropCommonOpts & {
  min?: number;
  max?: number;
  isInt?: boolean;
  isPositive?: boolean;
  unique?: boolean;
  ref?: string | DocumentExistsOpts;
  mustExists?: boolean;
} & IsNumberOptions;

export type PropNumberOpts = Omit<
  PropNumberCommonOpts,
  'arrayMinSize' | 'arrayMaxSize'
> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & CastToNumberOptions;
export type PropNumberOptionalOpts = Omit<PropNumberOpts, 'default'> & {
  default?: Nullable<PropNumberOpts['default']>;
};
export type PropNumberArrayOpts = PropNumberCommonOpts &
  CastToNumberArrayOptions;
export type PropNumberArrayOptionalOpts = Omit<
  PropNumberArrayOpts,
  'default'
> & {
  default?: Nullable<PropNumberOpts['default']>;
};
type SetPropOptions =
  | PropNumberOpts
  | PropNumberOptionalOpts
  | PropNumberArrayOpts
  | PropNumberArrayOptionalOpts;

export function $PropNumber(opts: PropNumberOpts = {}): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      {
        default: undefined,
        ...opts,
        isArray: false,
        isOptional: false,
      },
      target,
      property,
    );
  };
}

export function $PropNumberArray(
  opts: PropNumberArrayOpts = {},
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      {
        default: undefined,
        ...opts,
        isArray: true,
        isOptional: false,
      },
      target,
      property,
    );
  };
}

export function $PropNumberOptional(
  opts: PropNumberOptionalOpts = {},
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      {
        ...opts,
        isArray: false,
        isOptional: true,
      },
      target,
      property,
    );
  };
}

export function $PropNumberArrayOptional(
  opts: PropNumberArrayOptionalOpts = {},
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      {
        ...opts,
        isArray: true,
        isOptional: true,
      },
      target,
      property,
    );
  };
}

function setProp(
  opts: CommonPropOpts & SetPropOptions,
  target: any,
  property: any,
) {
  // Init final opts
  if (opts.isOptional && opts.default === undefined) {
    opts.default = null;
  }
  const prop: Required<PropertyOptions> = {
    swagger: {
      type: 'number',
      maximum: opts.max,
      minimum: opts.min,
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? Schema.Types.Number : [Schema.Types.Number],
      required: !opts.isOptional,
      default: opts.default,
      unique: opts.unique,
    },
    transformer: {
      expose: opts.exclude === true || opts.private === true ? false : true,
      exclude:
        opts.exclude === true || opts.private === true ? true : undefined,
      type: () => Number,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
  };

  // Set transform functions
  const transformToTypeOpts: CastToNumberOptions = {
    nullString: opts.nullString,
    undefinedString: opts.undefinedString,
    fixed: opts.fixed,
    round: opts.round,
  };

  if (!opts.isArray) {
    prop.transformer.transform?.push([
      TransformToNumber({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
  } else {
    prop.transformer.transform?.push([
      TransformToNumberArray({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
  }

  // User custom transform chain fn
  // Transform is not chainable
  if (opts.transform !== undefined) {
    prop.transformer.transform = opts.transform;
  }

  // Validations

  // Exists validation
  if (!opts.isOptional) {
    prop.validators.push(IsNotEmpty({ each: opts.isArray }));
  } else {
    prop.validators.push(IsOptional({ each: opts.isArray }));
  }

  // Type validation
  if (opts.isArray) {
    prop.validators.push(IsArray());
    opts.arrayMinSize = opts.arrayMinSize ?? 0;
    opts.arrayMaxSize = opts.arrayMaxSize ?? 0;
    if (opts.arrayMinSize > 0)
      prop.validators.push(ArrayMinSize(opts.arrayMinSize));
    if (opts.arrayMaxSize > 0)
      prop.validators.push(ArrayMaxSize(opts.arrayMaxSize));
  }

  prop.validators.push(
    IsNumber(
      {
        allowInfinity: opts.allowInfinity ?? false,
        allowNaN: opts.allowNaN ?? false,
        maxDecimalPlaces: opts.maxDecimalPlaces,
      },
      { each: opts.isArray },
    ),
  );

  // Lenght validation
  if (opts.min !== undefined)
    prop.validators.push(Min(opts.min, { each: opts.isArray }));
  if (opts.max !== undefined)
    prop.validators.push(Max(opts.max, { each: opts.isArray }));

  // Format validation
  if (opts.isInt === true) prop.validators.push(IsInt({ each: opts.isArray }));
  if (opts.isPositive === true)
    prop.validators.push(IsPositive({ each: opts.isArray }));

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
