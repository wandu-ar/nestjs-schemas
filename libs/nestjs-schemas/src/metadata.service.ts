/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, Logger } from '@nestjs/common';
import { _MetadataStorageV1 } from './helpers/metadata-storage';

@Injectable()
export class MetadataService {
  private readonly _storage = _MetadataStorageV1;
  private _cacheProjections: Map<string, any> = new Map();

  constructor() {
    Logger.debug('MetadataService from SchemasModule has been loaded.');
  }

  getProjection(schema: Function | string) {
    return this._getProjection(schema);
  }

  getFullProjection(schema: Function | string) {
    return this._getProjection(schema, false);
  }

  _getProjection(
    schema: Function | string,
    onlyTopLevel = true,
    parents: string[] = [],
    value: 1 | 'type' = 1,
  ) {
    let schemaKey = typeof schema === 'string' ? schema : schema.name;
    schemaKey += onlyTopLevel ? '_top_' + value : '_full_' + value;
    if (!this._cacheProjections.has(schemaKey)) {
      let projection: { [field: string]: any } = {};
      const schemaMetadata = this.getSchema(schema);
      if (schemaMetadata !== undefined) {
        for (const [property, propDef] of schemaMetadata.props.entries()) {
          if (propDef.options.transformer?.expose || !propDef.options.transformer?.exclude) {
            // La propiedad puede ser projectada?
            const subschemaProjection = this._getProjection(
              propDef.type.type,
              onlyTopLevel,
              [...parents, property],
              value,
            );
            // si solo se requiere primer nivel o no se puede proyectar
            if (
              onlyTopLevel ||
              !subschemaProjection ||
              (typeof subschemaProjection === 'object' && !Object.keys(subschemaProjection).length)
            ) {
              const key = [...parents, property].join('.');
              projection[key] = value === 1 ? 1 : propDef.type.type;
            } else {
              projection = { ...projection, ...subschemaProjection };
            }
          }
        }
        this._cacheProjections.set(schemaKey, projection);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._cacheProjections.get(schemaKey)!;
  }

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
  getMetadata<T = any>(
    key: string,
    schema: string | Function | Object, //
    property?: string,
  ) {
    return this._storage.getMetadata<T>(key, schema, property);
  }
}
