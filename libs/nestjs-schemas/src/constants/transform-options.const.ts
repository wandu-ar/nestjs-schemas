import { ClassTransformOptions } from 'class-transformer';

export const defaultTransformOptions: ClassTransformOptions = {
  excludePrefixes: ['_', '__'],
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
  exposeUnsetFields: true,
  // exposeUnsetFields anula Transform cuando se recibe un undefined
  // Por lo que no se pueden crear props virtuales con Transforms
  exposeDefaultValues: false,
};
