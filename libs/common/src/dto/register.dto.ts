import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['CLIENT', 'MERCHANT'])
  role: 'CLIENT' | 'MERCHANT';
}
