/* eslint-disable @typescript-eslint/ban-types */
import { ApiQuery, ApiQueryOptions } from '@nestjs/swagger';

export function ApiQueryObjectId(name: string, others?: ApiQueryOptions) {
  return <T>(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    ApiQuery({
      name: name,
      type: 'string',
      example: '62d5b896b81490f4f66ae1cf',
      ...others,
    })(target, propertyKey, descriptor);
  };
}
