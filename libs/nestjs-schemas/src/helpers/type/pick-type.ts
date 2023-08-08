import { Type } from '@nestjs/common';
import { PickType as NestJSSwaggerPickType } from '@nestjs/swagger';
import { _MetadataStorageV1 } from '../../helpers/metadata-storage';

export function $PickType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[],
): Type<Pick<T, (typeof keys)[number]>> {
  const PickTypeClass = NestJSSwaggerPickType(classRef, keys);
  // scope class
  Object.defineProperty(PickTypeClass, 'name', {
    value: `PickType_${classRef.name}_${keys.join('_')}`,
  });
  _MetadataStorageV1.copyProps(classRef, PickTypeClass, {
    includeProps: keys.map((item) => item.toString()),
  });
  return PickTypeClass;
}
