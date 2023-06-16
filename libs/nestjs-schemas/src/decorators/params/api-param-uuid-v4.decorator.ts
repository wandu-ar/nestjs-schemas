/* eslint-disable @typescript-eslint/ban-types */
import { ApiParam } from '@nestjs/swagger';

export function ApiParamUUIDv4(name: string, description?: string) {
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => {
    ApiParam({
      name: name,
      type: 'string',
      format: 'uuid v4 format',
      example: '91d80098-b96d-4549-8d8c-35ae9a195093',
      description: description,
    })(target, propertyKey, descriptor);
  };
}
