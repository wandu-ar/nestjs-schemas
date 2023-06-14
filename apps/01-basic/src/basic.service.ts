import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicService {
  getHello(): string {
    return 'Hello World!';
  }
}
