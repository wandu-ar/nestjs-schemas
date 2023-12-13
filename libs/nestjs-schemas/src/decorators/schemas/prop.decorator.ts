import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { _MetadataStorageV1 } from '../../helpers/metadata-storage';
import { PropertyOptions } from '../../types';
import { METADATA } from '../../constants';

export function $Prop(options: PropertyOptions = {}): PropertyDecorator {
  return (target: any, property: any) => {
    // Add information to metadata storage
    _MetadataStorageV1.setPropInSchema(target, property, options);

    // Apply decorators
    for (const group in options) {
      switch (group) {
        // Apply custom decorators
        case 'decorators':
          if (options.decorators !== undefined) {
            for (const groupKey in options.decorators) {
              const decorators = options.decorators[groupKey];
              decorators.forEach((Decorator: PropertyDecorator) => {
                if (Decorator(target, property) !== undefined) {
                  throw new Error(`
                    Invalid value detected in the decorators config of property ${property} in schema ${
                    target.name ?? target.constructor.name
                  } => ${
                    Decorator.name ?? Decorator.constructor.name ?? Decorator
                  }.
                    The value passed is not a valid decorator.
                    Remember make call over decorator function (add parenthesis).
                    For example, CustomDecorator(). Warning to use CustomDecorator without valid brackets.
                  `);
                }
              });
            }
          }
          break;
        // Apply swagger decorators
        case 'swagger':
          if (options.swagger !== undefined) {
            if (!options.swagger.hidden) {
              ApiProperty(options.swagger)(target, property);
            }
          }
          break;
        // Apply transformer decorators
        case 'transformer':
          if (options.transformer !== undefined) {
            // Expose
            if (options.transformer.expose !== undefined) {
              if (options.transformer.expose === true) {
                Expose()(target, property);
              } else if (typeof options.transformer.expose === 'object') {
                Expose(options.transformer.expose)(target, property);
              }
            }
            // Exclude
            if (options.transformer.exclude !== undefined) {
              if (options.transformer.exclude === true) {
                Exclude()(target, property);
              } else if (typeof options.transformer.exclude === 'object') {
                Exclude(options.transformer.exclude)(target, property);
              }
            }
            // Transform
            if (options.transformer.transform !== undefined) {
              options.transformer.transform.forEach((element) => {
                if (typeof element === 'function') {
                  Transform(element)(target, property);
                } else {
                  Transform(element[0], element[1])(target, property);
                }
              });
            }
            // Type
            if (options.transformer.type !== undefined) {
              if (typeof options.transformer.type === 'function') {
                Type(options.transformer.type)(target, property);
              } else if (
                Array.isArray(options.transformer.type) &&
                typeof options.transformer.type[0] === 'function'
              ) {
                Type(options.transformer.type[0], options.transformer.type[1])(
                  target,
                  property,
                );
              }
            }
          }
          break;
        // Apply validators decorators
        case 'validators':
          if (options.validators !== undefined) {
            const validators = options.validators;
            validators.forEach((ValidationDecorator) => {
              if (ValidationDecorator(target, property) !== undefined) {
                throw new Error(`
                  Invalid value detected in the validators config of property ${property} in schema ${
                  target.name ?? target.constructor.name
                } => ${
                  ValidationDecorator.name ??
                  ValidationDecorator.constructor.name ??
                  ValidationDecorator
                }.
                  The value passed is not a valid decorator.
                  Remember make call over decorator function (add parenthesis).
                  For example, IsArray(). Warning to use IsArray without valid brackets.
                `);
              }
            });
          }
          break;
        // Apply mongoose decorators
        case 'mongoose':
          if (options.mongoose !== undefined) {
            Prop(options.mongoose)(target, property);
          }
          break;
        case 'formItem':
          if (options.formItem) {
            if (typeof options.formItem === 'function') {
              const Decorator = options.formItem;
              Decorator(target, property);
            } else {
              _MetadataStorageV1.setMetadata(
                METADATA.FORM_ITEM_OPTS,
                options.formItem,
                target,
                property,
              );
            }
          }
          break;
      }
    }
  };
}
