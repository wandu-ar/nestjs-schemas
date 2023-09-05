import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LEG_SCHEMA, LegSchema } from './schemas';
import { SchemasModule } from '@wandu/nestjs-schemas';
import { LegsController } from './controllers';
import { LegsModelService, LegsService } from './services';

@Module({
  controllers: [LegsController],
  imports: [
    MongooseModule.forFeature([{ name: LEG_SCHEMA, schema: LegSchema }]),
    SchemasModule,
  ],
  providers: [LegsModelService, LegsService],
  exports: [LegsService],
})
export class LegsModule {}
