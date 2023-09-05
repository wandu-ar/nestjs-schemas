import { Module } from '@nestjs/common';
import { DummiesModule, LegsModule, ManikinsModule } from './modules';
import { ExamplesService } from './services/examples.service';

@Module({
  imports: [DummiesModule, ManikinsModule, LegsModule],
  providers: [ExamplesService],
  exports: [ExamplesService],
})
export class ExamplesModule {}
