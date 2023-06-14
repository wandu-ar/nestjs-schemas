import { Test, TestingModule } from '@nestjs/testing';
import { NestjsSchemasService } from './nestjs-schemas.service';

describe('NestjsSchemasService', () => {
  let service: NestjsSchemasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NestjsSchemasService],
    }).compile();

    service = module.get<NestjsSchemasService>(NestjsSchemasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
