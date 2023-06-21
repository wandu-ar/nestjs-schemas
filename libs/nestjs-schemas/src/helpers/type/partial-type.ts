import { Type } from '@nestjs/common';
import { PartialType as NestJSSwaggerPartialType } from '@nestjs/swagger';
import { _MetadataStorageV1 } from '../../helpers/metadata-storage';

export function $PartialType<T>(classRef: Type<T>): Type<Partial<T>> {
  const resultClass = NestJSSwaggerPartialType(classRef);
  _MetadataStorageV1.copyProps(classRef, resultClass, { makePartial: true });
  return resultClass;
}
