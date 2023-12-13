import { Schema } from 'mongoose';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import { ClassConstructor } from 'class-transformer';
import {
  CommonPropOpts,
  Nullable,
  PropCommonOpts,
  PropertyOptions,
} from '../../types';

type PropInstanceCommonOpts = PropCommonOpts /*& {}*/;

export type PropInstanceOpts<T> = Omit<
  PropInstanceCommonOpts,
  'arrayMinSize' | 'arrayMaxSize'
> & {
  arrayMinSize?: undefined;
  arrayMaxSize?: undefined;
} & {
  default?: T;
};

export type PropInstanceOptionalOpts<T> = PropInstanceCommonOpts & {
  default?: Nullable<T>;
};

export type PropInstanceArrayOpts<T> = PropInstanceCommonOpts & {
  default?: T[];
};

export type PropInstanceArrayOptionalOpts<T> = PropInstanceCommonOpts & {
  default?: Nullable<T[]>;
};

type SetPropOptions<T> =
  | PropInstanceOpts<T>
  | PropInstanceOptionalOpts<T>
  | PropInstanceArrayOpts<T>
  | PropInstanceArrayOptionalOpts<T>;

export function $PropInstance<T>(
  type: ClassConstructor<T>,
  opts: PropInstanceOpts<T> = {},
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      type,
      {
        ...opts,
        isArray: false,
        isOptional: false,
      },
      target,
      property,
    );
  };
}

export function $PropInstanceArray<T>(
  type: ClassConstructor<T>,
  opts: PropInstanceArrayOpts<T> = {},
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      type,
      {
        ...opts,
        isArray: true,
        isOptional: false,
      },
      target,
      property,
    );
  };
}

export function $PropInstanceOptional<T>(
  type: ClassConstructor<T>,
  opts: PropInstanceOptionalOpts<T> = {},
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      type,
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

export function $PropInstanceArrayOptional<T>(
  type: ClassConstructor<T>,
  opts: PropInstanceArrayOptionalOpts<T> = {},
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      type,
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

function setProp<T>(
  type: ClassConstructor<T>,
  opts: CommonPropOpts & SetPropOptions<T>,
  target: any,
  property: any,
) {
  // Init final opts
  if (opts.isOptional && opts.default === undefined) {
    opts.default = null;
  }
  const prop: Required<PropertyOptions> = {
    swagger: {
      type: type,
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
      type: () => type,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
    formItem: opts.formItem ?? { kind: 'DEFAULT' },
    opts,
  };

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

  prop.validators.push(ValidateNested({ each: opts.isArray }));

  // Other validations
  if (opts.validators !== undefined) {
    prop.validators = [...prop.validators, ...opts.validators];
  }

  $Prop(prop)(target, property);
}
