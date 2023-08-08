import { Type } from '@nestjs/common';
import { PartialType as NestJSSwaggerPartialType } from '@nestjs/swagger';
import { _MetadataStorageV1 } from '../../helpers/metadata-storage';

export function $PartialType<T>(classRef: Type<T>): Type<Partial<T>> {
  const PartialTypeClass = NestJSSwaggerPartialType(classRef);
  // scope class
  Object.defineProperty(PartialTypeClass, 'name', {
    value: `PartialType_${classRef.name}`,
  });
  _MetadataStorageV1.copyProps(classRef, PartialTypeClass, { makePartial: true });
  return PartialTypeClass;
}
