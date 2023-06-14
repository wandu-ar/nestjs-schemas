/* eslint-disable @typescript-eslint/ban-types */
import { ApiParam } from '@nestjs/swagger';

export function ApiParamObjectId(name: string, description?: string) {
  return <T>(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    ApiParam({
      name: name,
      type: 'string',
      format: '24-digit hex string',
      example: '62d5b896b81490f4f66ae1cf',
      description: description,
    })(target, propertyKey, descriptor);
  };
}
