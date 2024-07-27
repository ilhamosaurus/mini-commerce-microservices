import { IsNumber, IsPositive } from 'class-validator';

export class TopupDto {
  @IsPositive({ message: 'Amount must be greater than 0' })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;
}
