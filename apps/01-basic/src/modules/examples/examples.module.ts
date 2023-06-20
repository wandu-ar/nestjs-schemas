import { Module } from '@nestjs/common';
import { DummiesModule, ManikinsModule } from './modules';
import { RouterModule } from '@nestjs/core';
import { ExamplesService } from './services/examples.service';

@Module({
  imports: [
    RouterModule.register([
      { path: 'dummies', module: DummiesModule },
      { path: 'manikins', module: ManikinsModule },
    ]),
  ],
  providers: [ExamplesService],
})
export class ExamplesModule {}
