import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiPaginatedResponse,
  ApiParamUUIDv4,
  BaseController,
  ListParamsDto,
  UUIDv4,
  ParseUUIDv4Pipe,
  DEFAULT_ID_FIELD_NAME,
} from '@wandu/nestjs-schemas';

import { CreateLegDto, LegDto, UpdateLegDto } from '../dtos';
import { Leg, LEG_PK } from '../schemas';
import { LegsModelService, LegsService } from '../services';

@ApiTags('Legs')
@Controller()
export class LegsController extends BaseController<
  Leg,
  typeof LEG_PK,
  LegsModelService,
  LegsService,
  LegDto
> {
  constructor(protected readonly service: LegsService) {
    super(service);
  }

  @Get('/')
  @ApiPaginatedResponse(LegDto)
  async listAll(@Query() params: ListParamsDto) {
    return await super._listAllDocuments(params);
  }

  @Get('/populated')
  @ApiPaginatedResponse(LegDto)
  async listAllPopulated(@Query() params: ListParamsDto) {
    return await super._listAllDocuments(params);
  }

  @Get('/:id')
  @ApiParamUUIDv4(DEFAULT_ID_FIELD_NAME)
  async findById(@Param(DEFAULT_ID_FIELD_NAME, ParseUUIDv4Pipe) id: UUIDv4) {
    return await super._findById(id);
  }

  @Post('/')
  async create(@Body() input: CreateLegDto): Promise<LegDto> {
    return await super._create(input);
  }

  @Put('/:id')
  @ApiParamUUIDv4(DEFAULT_ID_FIELD_NAME)
  async update(
    @Param(DEFAULT_ID_FIELD_NAME, ParseUUIDv4Pipe) id: UUIDv4,
    @Body() input: UpdateLegDto,
  ): Promise<LegDto> {
    return await super._update(id, input);
  }

  @Delete('/:id')
  @ApiParamUUIDv4(DEFAULT_ID_FIELD_NAME)
  @HttpCode(204)
  async delete(@Param(DEFAULT_ID_FIELD_NAME, ParseUUIDv4Pipe) id: UUIDv4) {
    return await super._delete(id);
  }
}
