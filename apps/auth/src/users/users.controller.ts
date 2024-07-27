import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // async register(@Body() dto: RegisterDto) {
  //   return this.usersService.register(dto);
  // }

  @MessagePattern('register_user')
  async registerUser(@Payload() dto: RegisterDto) {
    return this.usersService.register(dto);
  }
}
