import { Injectable } from '@nestjs/common';
import { DummiesService, ManikinsService } from '../modules';

@Injectable()
export class ExamplesService {
  constructor(
    private readonly _dummies: DummiesService, //
    private readonly _manikins: ManikinsService,
  ) {}
}
