import { ClassTransformOptions } from 'class-transformer';

export const defaultTransformOptions: ClassTransformOptions = {
  excludePrefixes: ['_', '__'],
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
  exposeUnsetFields: true,
  // exposeUnsetFields anula Transform cuando se recibe un undefined
  // Por lo que no se pueden crear props virtuales con Transforms si el objeto el cual se pasa
  // a plainToInstance no llega esa propiedad, por lo que debe injectarse antes
  exposeDefaultValues: true,
};
