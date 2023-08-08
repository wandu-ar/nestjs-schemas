import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import {
  MetadataService,
  SchemaValidationPipe,
  defaultTransformOptions,
} from '@wandu/nestjs-schemas';
import { Address, ContactInfo, Example, ExampleInList } from './schemas';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

  const metadata = app.get(MetadataService);

  // Global interceptors
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludePrefixes: ['_', '__'],
    }),
  );

  // Don't use global pipes unless must be required
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { ...defaultTransformOptions },
      whitelist: true,
      validationError: {
        value: false,
        target: false,
      },
    }),
    new SchemaValidationPipe(metadata),
  );

  // It allows class-validator to use NestJS dependency injection container.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder().setTitle('NestJS Schemas - Basic example').build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [Example, ContactInfo, Address, ExampleInList],
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
