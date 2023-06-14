import { Type } from '@nestjs/common';
import { OmitType as NestJSSwaggerOmitType } from '@nestjs/swagger';
import { _MetadataStorageV1 } from '../../helpers/metadata-storage';

export function $OmitType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[],
): Type<Omit<T, (typeof keys)[number]>> {
  const resultClass = NestJSSwaggerOmitType(classRef, keys);
  _MetadataStorageV1.copyProps(classRef, resultClass, {
    excludeProps: keys.map((item) => item.toString()),
  });
  return resultClass;
}
