import { ClassTransformOptions } from 'class-transformer';

export const defaultTransformOptions: ClassTransformOptions = {
  excludePrefixes: ['_', '__'],
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
  exposeDefaultValues: true,
  exposeUnsetFields: true,
};
