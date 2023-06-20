import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MANIKIN_SCHEMA, ManikinSchema } from './schemas';
import { SchemasModule } from '@wandu-ar/nestjs-schemas';
import { ManikinsController } from './controllers';
import { ManikinsModelService, ManikinsService } from './services';

@Module({
  controllers: [ManikinsController],
  imports: [
    MongooseModule.forFeature([{ name: MANIKIN_SCHEMA, schema: ManikinSchema }]),
    SchemasModule,
  ],
  providers: [ManikinsModelService, ManikinsService],
  exports: [],
})
export class ManikinsModule {}
