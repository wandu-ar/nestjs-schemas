import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiPaginatedResponse,
  ApiParamUUIDv4,
  BaseController,
  ListParamsDto,
  UUIDv4,
  ParseUUIDv4Pipe,
} from '@wandu-ar/nestjs-schemas';

import { CreateDummyDto, DummyDto, UpdateDummyDto } from '../dtos';
import { Dummy, DUMMY_PK } from '../schemas';
import { DummiesModelService, DummiesService } from '../services';

@ApiTags('Dummies')
@Controller('/dummies')
export class DummiesController extends BaseController<
  Dummy,
  typeof DUMMY_PK,
  DummiesModelService,
  DummiesService,
  DummyDto
> {
  constructor(protected readonly service: DummiesService) {
    super(service);
  }

  @Get('/')
  @ApiPaginatedResponse(DummyDto)
  async listAll(@Query() params: ListParamsDto) {
    return await super._listAllDocuments(params);
  }

  @Get('/:id')
  @ApiParamUUIDv4('id')
  async findById(@Param(ParseUUIDv4Pipe) id: UUIDv4) {
    return await super._findById(id);
  }

  @Post('/')
  async create(@Body() input: CreateDummyDto): Promise<DummyDto> {
    return await super._create(input);
  }

  @Put('/:id')
  @ApiParamUUIDv4('id')
  async update(
    @Param(ParseUUIDv4Pipe) id: UUIDv4,
    @Body() input: UpdateDummyDto,
  ): Promise<DummyDto> {
    return await super._update(id, input);
  }

  @Delete('/:id')
  @ApiParamUUIDv4('id')
  @HttpCode(204)
  async delete(@Param(ParseUUIDv4Pipe) id: UUIDv4) {
    return await super._delete(id);
  }
}
