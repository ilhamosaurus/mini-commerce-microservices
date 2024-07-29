import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class PaymentDto {
  @IsNotEmpty()
  @IsString()
  product_code: string;

  @IsNumber()
  @IsPositive()
  @IsInt()
  qty: number;
}
