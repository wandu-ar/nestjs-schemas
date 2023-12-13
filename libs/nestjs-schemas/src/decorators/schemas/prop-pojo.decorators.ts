import { Schema } from 'mongoose';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import {
  CommonPropOpts,
  Nullable,
  PropCommonOpts,
  PropertyOptions,
} from '../../types';
import {
  CastToPojoArrayOptions,
  CastToPojoOptions,
  TransformToPojo,
  TransformToPojoArray,
} from '../../helpers';

type PropPojoCommonOpts = PropCommonOpts /*& {}*/;

export type PropPojoOpts = Omit<
  PropPojoCommonOpts,
  'arrayMinSize' | 'arrayMaxSize'
> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & CastToPojoOptions;
export type PropPojoOptionalOpts = Omit<PropPojoOpts, 'default'> & {
  default?: Nullable<PropPojoOpts['default']>;
};
export type PropPojoArrayOpts = PropPojoCommonOpts & CastToPojoArrayOptions;
export type PropPojoArrayOptionalOpts = Omit<PropPojoArrayOpts, 'default'> & {
  default?: Nullable<PropPojoOpts['default']>;
};
type SetPropOptions =
  | PropPojoOpts
  | PropPojoOptionalOpts
  | PropPojoArrayOpts
  | PropPojoArrayOptionalOpts;

export function $PropPojo(opts: PropPojoOpts = {}): PropertyDecorator {
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

export function $PropPojoArray(
  opts: PropPojoArrayOpts = {},
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

export function $PropPojoOptional(
  opts: PropPojoOptionalOpts = {},
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

export function $PropPojoArrayOptional(
  opts: PropPojoArrayOptionalOpts = {},
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
  //
  const prop: Required<PropertyOptions> = {
    swagger: {
      type: 'string',
      format: 'Valid JSON string format',
      example: opts.isArray
        ? ['{"name":"Steve","surname":"Jobs","company":"Apple"}']
        : '{"name":"Steve","surname":"Jobs","company":"Apple"}',
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? Schema.Types.Mixed : [Schema.Types.Mixed],
      required: !opts.isOptional,
      default: opts.default,
    },
    transformer: {
      expose: opts.exclude === true || opts.private === true ? false : true,
      exclude:
        opts.exclude === true || opts.private === true ? true : undefined,
      type: () => Object,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
    formItem: opts.formItem ?? null,
    opts,
  };

  // Set transform functions
  const transformToTypeOpts: CastToPojoOptions = {
    nullString: opts.nullString,
    undefinedString: opts.undefinedString,
  };

  if (!opts.isArray) {
    // To class only
    prop.transformer.transform?.push([
      TransformToPojo({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
    // To plain only
    prop.transformer.transform?.push([
      TransformToPojo(),
      { toPlainOnly: true },
    ]);
  } else {
    // To class only
    prop.transformer.transform?.push([
      TransformToPojoArray({
        ...transformToTypeOpts,
        default: <any>(<unknown>opts.default),
      }),
      { toClassOnly: true },
    ]);
    // To plain only
    prop.transformer.transform?.push([
      TransformToPojoArray(),
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

  prop.validators.push(IsObject({ each: opts.isArray }));

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
