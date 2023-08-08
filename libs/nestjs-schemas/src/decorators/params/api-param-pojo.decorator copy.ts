/* eslint-disable @typescript-eslint/ban-types */
import { ApiParam } from '@nestjs/swagger';

export function ApiParamPojo(name: string, description?: string) {
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => {
    ApiParam({
      name: name,
      type: 'string',
      format: 'Valid JSON string format',
      example: '{"name":"Steve","surname":"Jobs","company":"Apple"}',
      description: description,
    })(target, propertyKey, descriptor);
  };
}
