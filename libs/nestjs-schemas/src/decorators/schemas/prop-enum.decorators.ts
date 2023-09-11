import { Schema } from 'mongoose';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import {
  CommonPropOpts,
  Nullable,
  PropCommonOpts,
  PropertyOptions,
} from '../../types';
import { CastToStringArrayOptions, CastToStringOptions } from '../../helpers';

type PropEnumCommonOpts = PropCommonOpts & {
  enum: any[] | Record<string, any>;
  enumName: string;
  unique?: boolean;
};

export type PropEnumOpts = Omit<
  PropEnumCommonOpts,
  'arrayMinSize' | 'arrayMaxSize'
> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & CastToStringOptions;
export type PropEnumOptionalOpts = Omit<PropEnumOpts, 'default'> & {
  default?: Nullable<PropEnumOpts['default']>;
};
export type PropEnumArrayOpts = PropEnumCommonOpts & CastToStringArrayOptions;
export type PropEnumArrayOptionalOpts = Omit<PropEnumArrayOpts, 'default'> & {
  default?: Nullable<PropEnumOpts['default']>;
};
type SetPropOptions =
  | PropEnumOpts
  | PropEnumOptionalOpts
  | PropEnumArrayOpts
  | PropEnumArrayOptionalOpts;

export function $PropEnum(opts: PropEnumOpts): PropertyDecorator {
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

export function $PropEnumArray(opts: PropEnumArrayOpts): PropertyDecorator {
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

export function $PropEnumOptional(
  opts: PropEnumOptionalOpts,
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

export function $PropEnumArrayOptional(
  opts: PropEnumArrayOptionalOpts,
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
      enum: opts.enum,
      enumName: opts.enumName,
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? Schema.Types.String : [Schema.Types.String],
      enum: !opts.isOptional
        ? Object.values(opts.enum)
        : [...Object.values(opts.enum), null],
      required: !opts.isOptional,
      default: opts.default,
      unique: opts.unique,
    },
    transformer: {
      expose: opts.exclude === true || opts.private === true ? false : true,
      exclude:
        opts.exclude === true || opts.private === true ? true : undefined,
      type: () => String,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
    formItem: opts.formItem ?? null,
    opts,
  };

  // Set transform functions
  // const transformToTypeOpts = {
  //   default: <any>(<unknown>opts.default),
  //   nullString: opts.nullString,
  //   undefinedString: opts.undefinedString,
  //   case: opts.case,
  //   trim: opts.trim ?? true,
  // };

  /*   if (!opts.isArray) {
    prop.transformer.transform?.push([
      TransformToString(transformToTypeOpts),
      { toClassOnly: true },
    ]);
  } else {
    prop.transformer.transform?.push([
      TransformToStringArray(transformToTypeOpts),
      { toClassOnly: true },
    ]);
  }
 */

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

  prop.validators.push(IsEnum(opts.enum, { each: opts.isArray }));

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
