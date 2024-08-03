import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class PaymentDto {
  @ApiProperty({
    type: String,
    example: 'P001',
    description: 'product code',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  product_code: string;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'quantity',
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsInt()
  qty: number;
}
