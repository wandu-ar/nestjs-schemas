import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ModuleSettings } from './interfaces/module-settings.interface';

export const {
  ConfigurableModuleClass, //
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ModuleSettings>() //
  .setClassMethodName('forRoot')
  .build();
