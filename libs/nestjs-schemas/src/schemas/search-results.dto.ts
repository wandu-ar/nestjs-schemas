import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty()
  total!: number;

  @ApiPropertyOptional({ type: 'number', nullable: true })
  filtered: number | null = null;

  @ApiProperty()
  showing!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;

  @ApiProperty({ isArray: true, type: 'any', nullable: false })
  data!: T[];
}
