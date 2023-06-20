import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchemasModule } from '@wandu-ar/nestjs-schemas';
import { AppService } from './app.service';
import { DatabaseModule } from './database';
import { ExamplesModule } from './modules';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb://localhost:27017/nestjs-schemas-basic',
      }),
    }),
    DatabaseModule,
    SchemasModule.forRootAsync({
      useFactory: () => ({
        nodeEnv: process.env.NODE_ENV || 'development',
        skipDocumentExistsValidatorInTest: true,
      }),
    }),
    RouterModule.register([{ path: 'examples', module: ExamplesModule }]),
  ],
  providers: [AppService],
})
export class AppModule {}
