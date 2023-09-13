import { Schema } from 'mongoose';
import ValidatorJS from 'validator';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  IsUUID,
  UUIDVersion,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import {
  CommonPropOpts,
  Nullable,
  PropCommonOpts,
  PropertyOptions,
} from '../../types';
import {
  CastToStringArrayOptions,
  CastToStringOptions,
  TransformToString,
  TransformToStringArray,
} from '../../helpers';
import { DocumentExistsOpts } from '../validators';

type PropStringCommonOpts = PropCommonOpts & {
  minLenght?: number;
  maxLenght?: number;
  format?: string;
  pattern?: RegExp;
  unique?: boolean;
  isUrl?: boolean | ValidatorJS.IsURLOptions;
  isEmail?: boolean | ValidatorJS.IsEmailOptions;
  isUUID?: boolean | UUIDVersion;
  ref?: string | DocumentExistsOpts;
  mustExists?: boolean;
};

export type PropStringOpts = Omit<
  PropStringCommonOpts,
  'arrayMinSize' | 'arrayMaxSize'
> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & CastToStringOptions;
export type PropStringOptionalOpts = Omit<PropStringOpts, 'default'> & {
  default?: Nullable<PropStringOpts['default']>;
};
export type PropStringArrayOpts = PropStringCommonOpts &
  CastToStringArrayOptions;
export type PropStringArrayOptionalOpts = Omit<
  PropStringArrayOpts,
  'default'
> & {
  default?: Nullable<PropStringOpts['default']>;
};
type SetPropOptions =
  | PropStringOpts
  | PropStringOptionalOpts
  | PropStringArrayOpts
  | PropStringArrayOptionalOpts;

export function $PropString(opts: PropStringOpts = {}): PropertyDecorator {
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

export function $PropStringArray(
  opts: PropStringArrayOpts = {},
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

export function $PropStringOptional(
  opts: PropStringOptionalOpts = {},
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

export function $PropStringArrayOptional(
  opts: PropStringArrayOptionalOpts = {},
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
      format: opts.format,
      pattern: opts.pattern ? opts.pattern.toString() : undefined,
      maxLength: opts.maxLenght,
      minLength: opts.minLenght,
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? Schema.Types.String : [Schema.Types.String],
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
  const transformToTypeOpts = {
    default: <any>(<unknown>opts.default),
    nullString: opts.nullString,
    undefinedString: opts.undefinedString,
    case: opts.case,
    trim: opts.trim ?? true,
  };

  if (!opts.isArray) {
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

  prop.validators.push(IsString({ each: opts.isArray }));

  // Lenght validation
  if (opts.minLenght !== undefined)
    prop.validators.push(MinLength(opts.minLenght, { each: opts.isArray }));
  if (opts.maxLenght !== undefined)
    prop.validators.push(MaxLength(opts.maxLenght, { each: opts.isArray }));

  // Format validation
  if (opts.isUrl !== undefined && opts.isUrl !== false) {
    prop.validators.push(opts.isUrl === true ? IsUrl() : IsUrl(opts.isUrl));
  }

  if (opts.isEmail !== undefined && opts.isEmail !== false) {
    prop.validators.push(
      opts.isEmail === true ? IsEmail() : IsEmail(opts.isEmail),
    );
  }

  if (opts.isUUID !== undefined && opts.isUUID !== false) {
    prop.validators.push(opts.isUUID === true ? IsUUID() : IsUUID(opts.isUUID));
  }

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
