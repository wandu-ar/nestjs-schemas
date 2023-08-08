import { Type } from '@nestjs/common';
import { OmitType as NestJSSwaggerOmitType } from '@nestjs/swagger';
import { _MetadataStorageV1 } from '../../helpers/metadata-storage';

export function $OmitType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[],
): Type<Omit<T, (typeof keys)[number]>> {
  const OmitTypeClass = NestJSSwaggerOmitType(classRef, keys);

  // scope class
  Object.defineProperty(OmitTypeClass, 'name', {
    value: `OmitType_${classRef.name}_${keys.join('_')}`,
  });

  // copy props definition
  _MetadataStorageV1.copyProps(classRef, OmitTypeClass, {
    excludeProps: keys.map((item) => item.toString()),
  });
  // return new class
  return OmitTypeClass;
}
