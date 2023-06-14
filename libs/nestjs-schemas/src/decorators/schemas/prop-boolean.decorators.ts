import { Schema } from 'mongoose';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import { CommonPropOpts, Nullable, PropCommonOpts, PropertyOptions } from '../../types';
import {
  CastToBooleanArrayOptions,
  CastToBooleanOptions,
  TransformToBoolean,
  TransformToBooleanArray,
} from '../../helpers';

type PropBooleanCommonOpts = PropCommonOpts /*& {}*/;

export type PropBooleanOpts = Omit<PropBooleanCommonOpts, 'arrayMinSize' | 'arrayMaxSize'> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & CastToBooleanOptions;
export type PropBooleanOptionalOpts = Omit<PropBooleanOpts, 'default'> & {
  default?: Nullable<PropBooleanOpts['default']>;
};
export type PropBooleanArrayOpts = PropBooleanCommonOpts & CastToBooleanArrayOptions;
export type PropBooleanArrayOptionalOpts = Omit<PropBooleanArrayOpts, 'default'> & {
  default?: Nullable<PropBooleanOpts['default']>;
};
type SetPropOptions =
  | PropBooleanOpts
  | PropBooleanOptionalOpts
  | PropBooleanArrayOpts
  | PropBooleanArrayOptionalOpts;

export function $PropBoolean(opts: PropBooleanOpts = {}): PropertyDecorator {
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

export function $PropBooleanArray(opts: PropBooleanArrayOpts = {}): PropertyDecorator {
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

export function $PropBooleanOptional(opts: PropBooleanOptionalOpts = {}): PropertyDecorator {
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

export function $PropBooleanArrayOptional(
  opts: PropBooleanArrayOptionalOpts = {},
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

function setProp(opts: CommonPropOpts & SetPropOptions, target: any, property: any) {
  // Init final opts
  if (opts.isOptional && opts.default === undefined) {
    opts.default = null;
  }
  const prop: Required<PropertyOptions> = {
    swagger: {
      type: 'boolean',
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? Schema.Types.Boolean : [Schema.Types.Boolean],
      required: !opts.isOptional,
      default: opts.default,
    },
    transformer: {
      expose: opts.exclude === true || opts.private === true ? false : true,
      exclude: opts.exclude === true || opts.private === true ? true : undefined,
      type: () => Boolean,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
  };

  // Set transform functions
  const transformToTypeOpts: CastToBooleanOptions = {
    nullString: opts.nullString,
    undefinedString: opts.undefinedString,
  };

  if (!opts.isArray) {
    prop.transformer.transform?.push([
      TransformToBoolean({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
  } else {
    prop.transformer?.transform?.push([
      TransformToBooleanArray({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
  }

  // User custom transform chain fn
  if (opts.transform !== undefined) {
    prop.transformer.transform = []; //?.transform = [...opts.transform];
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
    if (opts.arrayMinSize > 0) prop.validators.push(ArrayMinSize(opts.arrayMinSize));
    if (opts.arrayMaxSize > 0) prop.validators.push(ArrayMaxSize(opts.arrayMaxSize));
  }

  prop.validators.push(IsBoolean({ each: opts.isArray }));

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
