import { Controller, Get, Param } from '@nestjs/common';
import { ListParamsDto, MetadataService, defaultTransformOptions } from '@wandu/nestjs-schemas';
import { plainToInstance } from 'class-transformer';

@Controller()
export class AppController {
  constructor(private readonly _metadata: MetadataService) {}

  @Get('params')
  async params() {
    const params: ListParamsDto = {
      filter: {
        operation: 'or',
        value: 'etc',
      },
    };

    return plainToInstance(
      ListParamsDto,
      {
        limit: 10,
        offset: 15,
        filter: params.filter,
      },
      defaultTransformOptions,
    );
  }

  @Get('test/:schemaName')
  async test(@Param('schemaName') schemaName: string) {
    const projection = this._metadata._getProjection(schemaName, false, [], 'type');
    console.log(projection);
    return JSON.parse(JSON.stringify(projection));
  }
}
