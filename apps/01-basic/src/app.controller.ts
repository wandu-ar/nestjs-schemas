/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-types */
import { Controller, Get } from '@nestjs/common';
import { LookupOpts, METADATA, MetadataService } from '@wandu/nestjs-schemas';
import { Example } from './schemas';
import { DummyListDto } from './modules/examples/modules/dummies/dtos/dummy-list.dto';
import { ManikinListDto } from './modules/examples/modules/manikins/dtos/manikin-list.dto';

@Controller()
export class AppController {
  constructor(private readonly _metadata: MetadataService) {}

  @Get('test')
  async test() {
    // const schema = this._metadata.getSchema(Example);
    // const schema = this._metadata.getSchema(DummyListDto);
    // const schema = this._metadata.getSchema(Example);
    // console.log(schema);
    const projection = this.__getProjection(Example, false, [], 'type');
    console.log(projection);
    return JSON.parse(JSON.stringify(projection));
  }

  protected __getProjection(
    schema: Function | string,
    onlyTopLevel = true,
    parents: string[] = [],
    value: 1 | 'type' = 1,
  ) {
    // let schemaKey = typeof schema === 'string' ? schema : schema.name;
    // schemaKey += onlyTopLevel ? '_top_' + value : '_full_' + value;
    let projection: { [field: string]: any } = {};
    const schemaMetadata = this._metadata.getSchema(schema);
    if (schemaMetadata !== undefined) {
      for (const [property, propDef] of schemaMetadata.props.entries()) {
        if (propDef.options.transformer?.expose || !propDef.options.transformer?.exclude) {
          // La propiedad puede ser projectada?
          const subschemaProjection = this.__getProjection(
            propDef.type.type,
            onlyTopLevel,
            [...parents, property],
            value,
          );
          // si solo se requiere primer nivel o no se puede proyectar
          if (onlyTopLevel || !Object.keys(subschemaProjection).length) {
            const key = [...parents, property].join('.');
            projection[key] = value === 1 ? 1 : propDef.type.type;
          } else {
            projection = { ...projection, ...subschemaProjection };
          }
        }
      }
    }
    return projection;
  }
}
