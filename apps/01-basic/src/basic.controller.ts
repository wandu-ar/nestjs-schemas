import { Controller, Get } from '@nestjs/common';
import { BasicService } from './basic.service';

@Controller()
export class BasicController {
  constructor(private readonly basicService: BasicService) {}

  @Get()
  getHello(): string {
    return this.basicService.getHello();
  }
}
