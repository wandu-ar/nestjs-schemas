import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DummiesModule } from './modules/dummies';
import { SchemasModule } from '@wandu-ar/nestjs-schemas';
import { AppService } from './app.service';
import { mode as uuidMode } from 'uuid-mongodb';

// Set globally
uuidMode('relaxed');

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [],
      useFactory: () => ({
        uri: 'mongodb://localhost:27017/nestjs-schemas-basic',
      }),
    }),
    SchemasModule.forRootAsync({
      useFactory: () => ({
        nodeEnv: process.env.NODE_ENV || 'development',
        skipDocumentExistsValidatorInTest: true,
      }),
    }),
    DummiesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
