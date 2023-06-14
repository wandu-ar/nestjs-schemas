import { Module } from '@nestjs/common';
import { NestjsSchemasService } from './nestjs-schemas.service';

@Module({
  providers: [NestjsSchemasService],
  exports: [NestjsSchemasService],
})
export class NestjsSchemasModule {}
