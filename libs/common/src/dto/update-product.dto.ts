import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsPositive,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    type: String,
    description: 'Product name',
    example: 'Product 1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Product price',
    example: 1000,
    required: true,
  })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @ApiProperty({
    type: Number,
    description: 'Product weight',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @IsNumber({ maxDecimalPlaces: 2 })
  weight?: number;

  @ApiProperty({
    type: String,
    description: 'Product description',
    example: 'Product 1 description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
