import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private _version = '';

  public setVersion(version: string) {
    if (this._version === '') this._version = version;
  }

  public getVersion(): string {
    return this._version;
  }
}
