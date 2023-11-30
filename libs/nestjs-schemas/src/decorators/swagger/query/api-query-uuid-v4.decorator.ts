/* eslint-disable @typescript-eslint/ban-types */
import { ApiQuery, ApiQueryOptions } from '@nestjs/swagger';

export function ApiQueryUUIDv4(name: string, others?: ApiQueryOptions) {
  return <T>(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    ApiQuery({
      name: name,
      type: 'string',
      example: '91d80098-b96d-4549-8d8c-35ae9a195093',
      ...others,
    })(target, propertyKey, descriptor);
  };
}
