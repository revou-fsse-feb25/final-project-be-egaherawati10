import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateServiceItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  /** Decimal as string, e.g. "25.00" */
  @ApiProperty({ example: '25.00' })
  @IsString()
  @IsNotEmpty()
  price!: string;
}