import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto } from '@app/common';
import { UsersService } from './users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // async login(
  //   @CurrentUser() user: User,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   await this.authService.login(user, res);
  //   return user;
  // }

  @MessagePattern('validate_user')
  async validateUser(@Payload() payload: any) {
    return this.authService.validateUser(payload.Authentication);
  }

  @MessagePattern('login')
  async loginUser(@Payload() dto: LoginDto) {
    const user = await this.userService.validateLogin(dto.email, dto.password);
    const token = await this.authService.login(user);
    return token;
  }
}
