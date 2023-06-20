import { Module } from '@nestjs/common';
import { DummiesModule, ManikinsModule } from './modules';
import { ExamplesService } from './services/examples.service';

@Module({
  imports: [DummiesModule, ManikinsModule],
  providers: [ExamplesService],
  exports: [ExamplesService],
})
export class ExamplesModule {}
