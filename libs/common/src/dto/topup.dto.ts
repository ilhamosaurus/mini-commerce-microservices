import { IsNumber, IsPositive } from 'class-validator';

export class TopupDto {
  @IsPositive({ message: 'Amount must be greater than 0' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'amount format invalid, must have 2 decimal places max' },
  )
  amount: number;
}
