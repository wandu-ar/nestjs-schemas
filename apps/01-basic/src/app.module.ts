import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DummiesModule } from './modules/dummies';
import { NestjsSchemasModule } from '../../../libs/nestjs-schemas/src';
import { AppService } from './app.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [],
      useFactory: () => ({
        uri: 'mongodb://localhost:27017/nestjs-schemas-basic',
      }),
    }),
    NestjsSchemasModule,
    DummiesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
