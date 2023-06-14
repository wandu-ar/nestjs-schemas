import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty()
  total!: number;

  @ApiPropertyOptional()
  filtered: number | null = null;

  @ApiProperty()
  showing!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;

  data!: T[];
}
