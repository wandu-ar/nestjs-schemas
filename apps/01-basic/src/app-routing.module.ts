import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DummiesModule, ExamplesModule, ManikinsModule } from './modules';
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
        ],
      },
    ]),
  ],
})
export class AppRoutingModule {}
