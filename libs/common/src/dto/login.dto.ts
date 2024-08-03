import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    type: String,
    example: 'k5jQ5@example.com',
    description: 'User email',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    example: '123456',
    description: 'User password',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginResponse {
  @ApiProperty({ type: String, description: "User's access token" })
  access_token: string;
}
