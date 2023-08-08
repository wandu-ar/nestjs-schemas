import { Controller, Get, Param } from '@nestjs/common';
import { MetadataService } from '@wandu/nestjs-schemas';

@Controller()
export class AppController {
  constructor(private readonly _metadata: MetadataService) {}

  @Get('test/:schemaName')
  async test(@Param('schemaName') schemaName: string) {
    const projection = this._metadata._getProjection(schemaName, false, [], 'type');
    console.log(projection);
    return JSON.parse(JSON.stringify(projection));
  }
}
