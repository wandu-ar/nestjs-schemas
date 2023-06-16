export interface ModuleSettings {
  nodeEnv: string | 'development' | 'production' | 'test';
  skipDocumentExistsValidatorInTest: boolean;
}
