import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    type: String,
    example: 'w7y9U@example.com',
    description: 'Email',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    example: 'password',
    description: 'Password',
    minLength: 6,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password should be at least 6 characters' })
  password: string;

  @ApiProperty({
    enum: ['CLIENT', 'MERCHANT'],
    required: true,
  })
  @IsEnum(['CLIENT', 'MERCHANT'])
  role: 'CLIENT' | 'MERCHANT';
}

export class RegisterResponse {
  @ApiProperty()
  _id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  role: 'CLIENT' | 'MERCHANT';
}
