import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class TopupDto {
  @IsNotEmpty()
  @IsPositive({ message: 'Amount must be a positive number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;
}
