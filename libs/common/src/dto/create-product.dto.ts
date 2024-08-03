import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    type: String,
    description: 'Product code',
    example: 'P001',
    maxLength: 6,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(6, { message: 'Code must be less than 6 characters long' })
  code: string;

  @ApiProperty({
    type: String,
    description: 'Product name',
    example: 'T-Shirt',
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
    example: 'T-Shirt',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
