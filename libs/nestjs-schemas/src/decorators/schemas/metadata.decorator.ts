import { _MetadataStorageV1 } from '../../helpers/metadata-storage';

export function $Metadata<T = any>(key: string, value: T): PropertyDecorator {
  return (target: any, property?: any) => {
    _MetadataStorageV1.setMetadata<T>(key, value, target, property);
  };
}
