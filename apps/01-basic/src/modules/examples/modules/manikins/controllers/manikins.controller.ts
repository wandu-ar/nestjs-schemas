import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiPaginatedResponse,
  ApiParamUUIDv4,
  BaseController,
  ListParamsDto,
  UUIDv4,
  ParseUUIDv4Pipe,
  DEFAULT_ID_FIELD_NAME,
} from '@wandu-ar/nestjs-schemas';

import { CreateManikinDto, ManikinDto, UpdateManikinDto } from '../dtos';
import { Manikin, MANIKIN_PK } from '../schemas';
import { ManikinsModelService, ManikinsService } from '../services';
import { ManikinListDto } from '../dtos/manikin-list.dto';

@ApiTags('Manikins')
@Controller()
export class ManikinsController extends BaseController<
  Manikin,
  typeof MANIKIN_PK,
  ManikinsModelService,
  ManikinsService,
  ManikinDto
> {
  constructor(protected readonly service: ManikinsService) {
    super(service);
  }

  @Get('/')
  @ApiPaginatedResponse(ManikinDto)
  async listAll(@Query() params: ListParamsDto) {
    return await super._listAllDocuments(params);
  }

  @Get('/populated')
  @ApiPaginatedResponse(ManikinDto)
  async listAllPopulated(@Query() params: ListParamsDto) {
    return await super._listAllDocuments(params, { returnAs: ManikinListDto });
  }

  @Get('/:id')
  @ApiParamUUIDv4(DEFAULT_ID_FIELD_NAME)
  async findById(@Param(DEFAULT_ID_FIELD_NAME, ParseUUIDv4Pipe) id: UUIDv4) {
    return await super._findById(id);
  }

  @Post('/')
  async create(@Body() input: CreateManikinDto): Promise<ManikinDto> {
    return await super._create(input);
  }

  @Put('/:id')
  @ApiParamUUIDv4(DEFAULT_ID_FIELD_NAME)
  async update(
    @Param(DEFAULT_ID_FIELD_NAME, ParseUUIDv4Pipe) id: UUIDv4,
    @Body() input: UpdateManikinDto,
  ): Promise<ManikinDto> {
    return await super._update(id, input);
  }

  @Delete('/:id')
  @ApiParamUUIDv4(DEFAULT_ID_FIELD_NAME)
  @HttpCode(204)
  async delete(@Param(DEFAULT_ID_FIELD_NAME, ParseUUIDv4Pipe) id: UUIDv4) {
    return await super._delete(id);
  }
}
