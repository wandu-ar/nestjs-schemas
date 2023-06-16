import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DUMMY_SCHEMA, DummySchema } from './schemas';
import { NestjsSchemasModule } from '@wandu-ar/nestjs-schemas';
import { DummiesController } from './controllers';
import { DummiesModelService, DummiesService } from './services';

@Module({
  controllers: [DummiesController],
  imports: [
    MongooseModule.forFeature([{ name: DUMMY_SCHEMA, schema: DummySchema }]),
    NestjsSchemasModule,
  ],
  providers: [DummiesModelService, DummiesService],
  exports: [],
})
export class DummiesModule {}
