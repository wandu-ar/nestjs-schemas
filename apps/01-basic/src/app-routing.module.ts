import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import {
  DummiesModule,
  ExamplesModule,
  LegsModule,
  ManikinsModule,
} from './modules';
import { AppModule } from './app.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/',
        module: AppModule,
      },
      {
        path: 'examples',
        module: ExamplesModule,
        children: [
          { path: 'dummies', module: DummiesModule },
          { path: 'manikins', module: ManikinsModule },
          { path: 'legs', module: LegsModule },
        ],
      },
    ]),
  ],
})
export class AppRoutingModule {}
