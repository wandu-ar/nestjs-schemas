import { ClassTransformOptions } from 'class-transformer';

export const defaultTransformOptions: ClassTransformOptions = {
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
  exposeDefaultValues: true,
  exposeUnsetFields: true,
};
