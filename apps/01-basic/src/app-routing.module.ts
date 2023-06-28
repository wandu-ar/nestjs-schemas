import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DummiesModule, ExamplesModule, ManikinsModule } from './modules';
import { T5sModule } from './t5s/t5s.module';
import { T6sModule } from './t6s/t6s.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'examples',
        module: ExamplesModule,
        children: [
          { path: 'dummies', module: DummiesModule },
          { path: 'manikins', module: ManikinsModule },
        ],
      },
    ]),
  ],
})
export class AppRoutingModule {}
