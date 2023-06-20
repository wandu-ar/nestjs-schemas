import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DUMMY_SCHEMA, DummySchema } from './schemas';
import { SchemasModule } from '@wandu/nestjs-schemas';
import { DummiesController } from './controllers';
import { DummiesModelService, DummiesService } from './services';

@Module({
  controllers: [DummiesController],
  imports: [
    MongooseModule.forFeature([{ name: DUMMY_SCHEMA, schema: DummySchema }]),
    SchemasModule,
  ],
  providers: [DummiesModelService, DummiesService],
  exports: [DummiesService],
})
export class DummiesModule {}
