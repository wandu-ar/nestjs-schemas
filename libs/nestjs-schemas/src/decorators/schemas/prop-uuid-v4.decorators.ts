import { Schema } from 'mongoose';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import {
  CommonPropOpts,
  Nullable,
  PropCommonOpts,
  PropertyOptions,
} from '../../types';
import {
  CastToUUIDv4ArrayOptions,
  CastToUUIDv4Options,
  TransformToUUIDv4,
  TransformToUUIDv4Array,
  TransformToString,
  TransformToStringArray,
  Binary,
} from '../../helpers';
import { DocumentExists, DocumentExistsOpts } from '../validators';

type PropUUIDv4CommonOpts = PropCommonOpts & {
  ref?: string | DocumentExistsOpts;
  mustExists?: boolean;
  unique?: boolean;
};

export type PropUUIDv4Opts = Omit<
  PropUUIDv4CommonOpts,
  'arrayMinSize' | 'arrayMaxSize'
> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & CastToUUIDv4Options;
export type PropUUIDv4OptionalOpts = Omit<PropUUIDv4Opts, 'default'> & {
  default?: Nullable<PropUUIDv4Opts['default']>;
};
export type PropUUIDv4ArrayOpts = PropUUIDv4CommonOpts &
  CastToUUIDv4ArrayOptions;
export type PropUUIDv4ArrayOptionalOpts = Omit<
  PropUUIDv4ArrayOpts,
  'default'
> & {
  default?: Nullable<PropUUIDv4Opts['default']>;
};
type SetPropOptions =
  | PropUUIDv4Opts
  | PropUUIDv4OptionalOpts
  | PropUUIDv4ArrayOpts
  | PropUUIDv4ArrayOptionalOpts;

export function $PropUUIDv4(opts: PropUUIDv4Opts = {}): PropertyDecorator {
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

export function $PropUUIDv4Array(
  opts: PropUUIDv4ArrayOpts = {},
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

export function $PropUUIDv4Optional(
  opts: PropUUIDv4OptionalOpts = {},
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

export function $PropUUIDv4ArrayOptional(
  opts: PropUUIDv4ArrayOptionalOpts = {},
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
  // Ref opts
  const ref = opts.ref
    ? typeof opts.ref === 'string'
      ? { collection: opts.ref }
      : { ...opts.ref }
    : undefined;
  //
  const prop: Required<PropertyOptions> = {
    swagger: {
      type: 'string',
      description: ref
        ? `Reference to ${ref.field ? ref.field : 'id'} field of ${
            ref.collection
          } documents`
        : undefined,
      format: 'uuid v4 format',
      example: opts.isArray
        ? ['91d80098-b96d-4549-8d8c-35ae9a195093']
        : '91d80098-b96d-4549-8d8c-35ae9a195093',
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? Schema.Types.Buffer : [Schema.Types.Buffer],
      required: !opts.isOptional,
      default: opts.default,
      unique: opts.unique,
    },
    transformer: {
      expose: opts.exclude === true || opts.private === true ? false : true,
      exclude:
        opts.exclude === true || opts.private === true ? true : undefined,
      type: () => Binary,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
    formItem: opts.formItem ?? null,
    opts,
  };

  // Set transform functions
  const transformToTypeOpts: CastToUUIDv4Options = {
    nullString: opts.nullString,
    undefinedString: opts.undefinedString,
  };

  if (!opts.isArray) {
    // To class only
    prop.transformer.transform?.push([
      TransformToUUIDv4({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
    // To plain only
    prop.transformer.transform?.push([
      TransformToString(),
      { toPlainOnly: true },
    ]);
  } else {
    // To class only
    prop.transformer.transform?.push([
      TransformToUUIDv4Array({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
    // To plain only
    prop.transformer.transform?.push([
      TransformToStringArray(),
      { toPlainOnly: true },
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

  // Document exists
  if (ref && opts.mustExists) {
    prop.validators.push(DocumentExists(ref, { each: opts.isArray }));
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

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
