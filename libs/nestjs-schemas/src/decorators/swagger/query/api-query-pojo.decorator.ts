/* eslint-disable @typescript-eslint/ban-types */
import { ApiQuery, ApiQueryOptions } from '@nestjs/swagger';

export function ApiQueryPojo(name: string, others?: ApiQueryOptions) {
  return <T>(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    ApiQuery({
      name: name,
      type: 'string',
      example: '{"name":"Steve","surname":"Jobs","company":"Apple"}',
      ...others,
    })(target, propertyKey, descriptor);
  };
}
