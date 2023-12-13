import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { $Prop } from './prop.decorator';
import {
  CommonPropOpts,
  Nullable,
  PropCommonOpts,
  PropertyOptions,
} from '../../types';
import { ClassConstructor } from 'class-transformer';
import { $Metadata } from './metadata.decorator';
import { METADATA, DEFAULT_ID_FIELD_NAME } from '../../constants';

type PropSubSchemaCommonOpts = PropCommonOpts & {
  lookup: Omit<LookupOpts, 'justOne'> | string;
};

export type LookupOpts = {
  from: string;
  localField?: string;
  foreignField?: string;
  preserveNullAndEmptyArrays?: boolean;
  justOne?: boolean;
};

export type PropSubSchemaOpts<T> = Omit<
  PropSubSchemaCommonOpts,
  'arrayMinSize' | 'arrayMaxSize'
> & { arrayMinSize?: undefined; arrayMaxSize?: undefined } & {
  default?: T;
};
export type PropSubSchemaOptionalOpts<T> = PropSubSchemaCommonOpts & {
  default?: Nullable<T>;
};
export type PropSubSchemaArrayOpts<T> = PropSubSchemaCommonOpts & {
  default?: T[];
};
export type PropSubSchemaArrayOptionalOpts<T> = PropSubSchemaCommonOpts & {
  default?: Nullable<T[]>;
};

type SetPropOptions<T> =
  | PropSubSchemaOpts<T>
  | PropSubSchemaOptionalOpts<T>
  | PropSubSchemaArrayOpts<T>
  | PropSubSchemaArrayOptionalOpts<T>;

export function $PropSubSchema<T>(
  subSchema: ClassConstructor<T>,
  opts: PropSubSchemaOpts<T>,
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      subSchema,
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

export function $PropSubSchemaArray<T>(
  subSchema: ClassConstructor<T>,
  opts: PropSubSchemaArrayOpts<T>,
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      subSchema,
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

export function $PropSubSchemaOptional<T>(
  subSchema: ClassConstructor<T>,
  opts: PropSubSchemaOptionalOpts<T>,
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      subSchema,
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

export function $PropSubSchemaArrayOptional<T>(
  subSchema: ClassConstructor<T>,
  opts: PropSubSchemaArrayOptionalOpts<T>,
): PropertyDecorator {
  return (target: any, property: any) => {
    setProp(
      subSchema,
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
  subSchema: ClassConstructor<T>,
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
      type: subSchema,
      nullable: opts.isOptional,
      default: opts.default,
      required: !opts.isOptional,
      hidden: opts.private,
      isArray: opts.isArray,
    },
    mongoose: {
      type: !opts.isArray ? subSchema : [subSchema],
      required: !opts.isOptional,
      default: opts.default,
    },
    transformer: {
      expose: opts.exclude === true || opts.private === true ? false : true,
      exclude:
        opts.exclude === true || opts.private === true ? true : undefined,
      type: () => subSchema,
      transform: [],
    },
    validators: [],
    decorators: { __propDef: [] },
    formItem: opts.formItem ?? { kind: 'DEFAULT' },
    opts,
  };

  // Configure lookup
  const lookup: LookupOpts = {
    from: typeof opts.lookup === 'string' ? opts.lookup : opts.lookup.from,
    localField: property,
    foreignField: DEFAULT_ID_FIELD_NAME,
    justOne: !opts.isArray,
    preserveNullAndEmptyArrays: opts.isOptional,
  };

  if (typeof opts.lookup !== 'string') {
    if (opts.lookup.localField) lookup.localField = opts.lookup.localField;
    if (opts.lookup.foreignField)
      lookup.foreignField = opts.lookup.foreignField;
    if (opts.lookup.preserveNullAndEmptyArrays)
      lookup.preserveNullAndEmptyArrays =
        opts.lookup.preserveNullAndEmptyArrays;
  }

  prop.decorators.__propDef.push(
    $Metadata<NonNullable<LookupOpts>>(METADATA.MONGOOSE_LOOKUP, lookup),
  );

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
