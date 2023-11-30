import {
  PipeTransform,
  Injectable,
  Optional,
  HttpStatus,
  ArgumentMetadata,
} from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { ObjectId } from '../helpers';
import {
  ErrorHttpStatusCode,
  HttpErrorByCode,
} from '@nestjs/common/utils/http-error-by-code.util';

export interface ParseObjectIdPipeOptions {
  errorHttpStatusCode?: ErrorHttpStatusCode;
  exceptionFactory?: (error: string) => any;
  optional?: boolean;
}

@Injectable()
export class ParseObjectIdPipe
  implements PipeTransform<string, Promise<ObjectId>>
{
  protected exceptionFactory: (error: string) => any;

  constructor(
    @Optional() protected readonly options?: ParseObjectIdPipeOptions,
  ) {
    options = options || {};
    const { exceptionFactory, errorHttpStatusCode = HttpStatus.BAD_REQUEST } =
      options;
    this.exceptionFactory =
      exceptionFactory ||
      ((error) => new HttpErrorByCode[errorHttpStatusCode](error));
  }

  /**
   * Method that accesses and performs optional transformation on argument for
   * in-flight requests.
   *
   * @param value currently processed route argument
   * @param metadata contains metadata about the currently processed route argument
   */
  async transform(
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Promise<ObjectId> {
    if (isNil(value) && this.options?.optional) {
      return value;
    }

    if (ObjectId.isValid(value)) {
      return new ObjectId(value);
    }

    throw this.exceptionFactory(
      'Validation failed (object id string is expected)',
    );
  }
}
