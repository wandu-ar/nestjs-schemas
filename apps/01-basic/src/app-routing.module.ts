import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DummiesModule, ExamplesModule, ManikinsModule } from './modules';

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
