import { DynamicModule, Global, Module } from '@nestjs/common';
import { mode } from 'uuid-mongodb';
import { DocumentExistsValidator } from './decorators';
import { MetadataService } from './metadata.service';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './schemas.module-definition';

/**
 * Almacena la config del módulo de forma global
 */
@Global()
@Module({})
class SchemasHostModule extends ConfigurableModuleClass {
  // Sync
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    // Set globally
    mode('relaxed');
    return {
      ...super.forRoot(options),
      exports: [MODULE_OPTIONS_TOKEN],
    };
  }
  // Async
  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    // Set globally
    mode('relaxed');
    return {
      ...super.forRootAsync(options),
      exports: [MODULE_OPTIONS_TOKEN],
    };
  }
}

/**
 * Módulo para que se generen singletones al importar el módulo
 */
@Module({
  providers: [MetadataService, DocumentExistsValidator],
  exports: [MetadataService, DocumentExistsValidator],
})
class SchemasSharedModule {}

/**
 * Módulo principal expuesto al desarrollador
 */
@Module({
  imports: [SchemasSharedModule],
  exports: [SchemasSharedModule],
})
export class SchemasModule extends ConfigurableModuleClass {
  // Sync
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      ...super.forRoot(options),
      imports: [SchemasHostModule.forRoot(options)],
    };
  }
  // Async
  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      ...super.forRootAsync(options),
      imports: [SchemasHostModule.forRootAsync(options)],
    };
  }
}
