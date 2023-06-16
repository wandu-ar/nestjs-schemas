import { Injectable } from '@nestjs/common';
import { DatabaseService, MetadataService } from '@wandu-ar/nestjs-schemas';

@Injectable()
export class AppService {
  private _version = '';

  constructor(
    private readonly _metadata: MetadataService,
    private readonly _database: DatabaseService,
  ) {
    console.log('Soy el constructor de AppService');
  }

  public setVersion(version: string) {
    if (this._version === '') this._version = version;
  }

  public getVersion(): string {
    return this._version;
  }
}
