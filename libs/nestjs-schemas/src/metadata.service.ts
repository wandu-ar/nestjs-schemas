/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import { _MetadataStorageV1 } from './helpers/metadata-storage';

@Injectable()
export class MetadataService {
  private readonly _storage = _MetadataStorageV1;

  /**
   * Get saved schemas from storage.
   */
  getSchemas() {
    return this._storage.getSchemas();
  }

  /**
   * Get saved schema from storage.
   */
  getSchema(schema: string | Function | Object) {
    return this._storage.getSchema(schema);
  }

  /**
   * Find if schema exists
   */
  schemaExists(schema: string | Function | Object) {
    return this._storage.schemaExists(schema);
  }

  /**
   * Get saved schema props from storage.
   */
  getProps(schema: string | Function | Object) {
    return this._storage.getProps(schema);
  }

  /**
   * Get saved schema prop from storage.
   */
  getProp(schema: string | Function | Object, property: string) {
    return this._storage.getProp(schema, property);
  }

  /**
   * Return list of all properties of schema or undefined if not exists
   */
  getPropsList(schema: string | Function | Object) {
    return this._storage.getPropsList(schema);
  }

  /**
   * Get saved prop metadata from storage
   */
  getMetadata(
    key: string,
    schema: string | Function | Object, //
    property?: string,
  ): any {
    return this._storage.getMetadata(key, schema, property);
  }
}
