import { Schema } from 'mongoose';
import { IsArray, ArrayMinSize, ArrayMaxSize, IsNotEmpty, IsOptional } from 'class-validator';
import { $Prop } from './prop.decorator';
import { CommonPropOpts, Nullable, PropCommonOpts, PropertyOptions } from '../../types';
import {
  CastToObjectIdArrayOptions,
  CastToObjectIdOptions,
  ObjectId,
  TransformToObjectId,
  TransformToObjectIdArray,
  TransformToString,
  TransformToStringArray,
} from '../../helpers';
import { DocumentExists, DocumentExistsOpts } from '../validators';

type PropObjectIdCommonOpts = PropCommonOpts & {
  ref?: string | DocumentExistsOpts;
  mustExists?: boolean;
  unique?: boolean;
};

export type PropObjectIdOpts = Omit<PropObjectIdCommonOpts, 'arrayMinSize' | 'arrayMaxSize'> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & CastToObjectIdOptions;
export type PropObjectIdOptionalOpts = Omit<PropObjectIdOpts, 'default'> & {
  default?: Nullable<PropObjectIdOpts['default']>;
};
export type PropObjectIdArrayOpts = PropObjectIdCommonOpts & CastToObjectIdArrayOptions;
export type PropObjectIdArrayOptionalOpts = Omit<PropObjectIdArrayOpts, 'default'> & {
  default?: Nullable<PropObjectIdOpts['default']>;
};
type SetPropOptions =
  | PropObjectIdOpts
  | PropObjectIdOptionalOpts
  | PropObjectIdArrayOpts
  | PropObjectIdArrayOptionalOpts;

export function $PropObjectId(opts: PropObjectIdOpts = {}): PropertyDecorator {
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

export function $PropObjectIdArray(opts: PropObjectIdArrayOpts = {}): PropertyDecorator {
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

export function $PropObjectIdOptional(opts: PropObjectIdOptionalOpts = {}): PropertyDecorator {
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

export function $PropObjectIdArrayOptional(
  opts: PropObjectIdArrayOptionalOpts = {},
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
      type: 'string',
      format: '24-digit hex string',
      example: opts.isArray ? ['62d5b896b81490f4f66ae1cf'] : '62d5b896b81490f4f66ae1cf',
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? Schema.Types.ObjectId : [Schema.Types.ObjectId],
      required: !opts.isOptional,
      default: opts.default,
      unique: opts.unique,
    },
    transformer: {
      expose: opts.exclude === true || opts.private === true ? false : true,
      exclude: opts.exclude === true || opts.private === true ? true : undefined,
      type: () => ObjectId,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
  };

  // Set transform functions
  const transformToTypeOpts: CastToObjectIdOptions = {
    nullString: opts.nullString,
    undefinedString: opts.undefinedString,
  };

  if (!opts.isArray) {
    // To class only
    prop.transformer?.transform?.push([
      TransformToObjectId({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
    // To plain only
    prop.transformer?.transform?.push([TransformToString(), { toPlainOnly: true }]);
  } else {
    // To class only
    prop.transformer?.transform?.push([
      TransformToObjectIdArray({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
    // To plain only
    prop.transformer?.transform?.push([TransformToStringArray(), { toPlainOnly: true }]);
  }

  // User custom transform chain fn
  if (opts.transform !== undefined) {
    prop.transformer.transform = [...opts.transform];
  }

  // Validations

  // Exists validation
  if (!opts.isOptional) {
    prop.validators.push(IsNotEmpty({ each: opts.isArray }));
  } else {
    prop.validators.push(IsOptional({ each: opts.isArray }));
  }

  // Document exists
  if (opts.ref && opts.mustExists) {
    const existsOpts = typeof opts.ref === 'string' ? { collection: opts.ref } : { ...opts.ref };
    prop.validators.push(DocumentExists(existsOpts, { each: opts.isArray }));
  }

  // Type validation
  if (opts.isArray) {
    prop.validators.push(IsArray());
    opts.arrayMinSize = opts.arrayMinSize ?? 0;
    opts.arrayMaxSize = opts.arrayMaxSize ?? 0;
    if (opts.arrayMinSize > 0) prop.validators.push(ArrayMinSize(opts.arrayMinSize));
    if (opts.arrayMaxSize > 0) prop.validators.push(ArrayMaxSize(opts.arrayMaxSize));
  }

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
