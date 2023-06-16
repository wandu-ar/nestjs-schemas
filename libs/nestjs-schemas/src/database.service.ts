import { Connection } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private readonly connection: Connection) {
    Logger.debug('DatabaseService from SchemasModule has been loaded.');
  }

  getConnection(): Connection {
    return this.connection;
  }
}
