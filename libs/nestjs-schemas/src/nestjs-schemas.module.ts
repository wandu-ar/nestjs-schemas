import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DocumentExistsValidator } from './decorators';
import { MetadataService } from './metadata.service';

@Module({
  providers: [MetadataService, DatabaseService, DocumentExistsValidator],
  exports: [MetadataService, DatabaseService, DocumentExistsValidator],
})
export class NestjsSchemasModule {}
