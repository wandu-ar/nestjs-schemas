import { Schema } from 'mongoose';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsDate,
  MaxDate,
  MinDate,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import {
  CommonPropOpts,
  Nullable,
  PropCommonOpts,
  PropertyOptions,
} from '../../types';
import {
  CastToDateArrayOptions,
  CastToDateOptions,
  TransformToDate,
  TransformToDateArray,
} from '../../helpers';

type PropDateCommonOpts = PropCommonOpts & {
  minDate?: Date;
  maxDate?: Date;
  unique?: boolean;
};

export type PropDateOpts = Omit<
  PropDateCommonOpts,
  'arrayMinSize' | 'arrayMaxSize'
> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & CastToDateOptions;
export type PropDateOptionalOpts = Omit<PropDateOpts, 'default'> & {
  default?: Nullable<PropDateOpts['default']>;
};
export type PropDateArrayOpts = PropDateCommonOpts & CastToDateArrayOptions;
export type PropDateArrayOptionalOpts = Omit<PropDateArrayOpts, 'default'> & {
  default?: Nullable<PropDateOpts['default']>;
};
type SetPropOptions =
  | PropDateOpts
  | PropDateOptionalOpts
  | PropDateArrayOpts
  | PropDateArrayOptionalOpts;

export function $PropDate(opts: PropDateOpts = {}): PropertyDecorator {
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

export function $PropDateArray(
  opts: PropDateArrayOpts = {},
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

export function $PropDateOptional(
  opts: PropDateOptionalOpts = {},
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

export function $PropDateArrayOptional(
  opts: PropDateArrayOptionalOpts = {},
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
      type: 'string',
      format: 'date-time',
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? Schema.Types.Date : [Schema.Types.Date],
      required: !opts.isOptional,
      default: opts.default,
      unique: opts.unique,
    },
    transformer: {
      expose: opts.exclude === true || opts.private === true ? false : true,
      exclude:
        opts.exclude === true || opts.private === true ? true : undefined,
      type: () => Date,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
    formItem: opts.formItem ?? null,
    opts,
  };

  // Set transform functions
  const transformToTypeOpts = {
    default: <any>(<unknown>opts.default),
    nullString: opts.nullString,
    undefinedString: opts.undefinedString,
  };

  if (!opts.isArray) {
    prop.transformer.transform?.push([
      TransformToDate(transformToTypeOpts),
      { toClassOnly: true },
    ]);
  } else {
    prop.transformer.transform?.push([
      TransformToDateArray(transformToTypeOpts),
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
    opts.arrayMinSize = opts.arrayMinSize ?? (opts.isOptional ? 0 : 1);
    opts.arrayMaxSize = opts.arrayMaxSize ?? null;
    if (opts.arrayMaxSize && opts.arrayMaxSize < opts.arrayMinSize) {
      throw new Error('Array max size is lower than array min size');
    }
    if (opts.arrayMinSize > 0) {
      prop.validators.push(ArrayMinSize(opts.arrayMinSize));
    }
    if (opts.arrayMaxSize && opts.arrayMaxSize > 0) {
      prop.validators.push(ArrayMaxSize(opts.arrayMaxSize));
    }
  }

  prop.validators.push(IsDate({ each: opts.isArray }));

  // Date validation
  if (opts.minDate !== undefined)
    prop.validators.push(MinDate(opts.minDate, { each: opts.isArray }));
  if (opts.maxDate !== undefined)
    prop.validators.push(MaxDate(opts.maxDate, { each: opts.isArray }));

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
