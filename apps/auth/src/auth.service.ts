import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from './users/schemas/user.schema';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { UsersService } from './users/users.service';
import { Types } from 'mongoose';

export interface TokenPayload {
  userId: string;
  role: 'CLIENT' | 'MERCHANT';
}
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async login(user: User) {
    try {
      const tokenPayload: TokenPayload = {
        userId: user._id.toHexString(),
        role: user.role,
      };

      const token = this.jwtService.sign(tokenPayload, { expiresIn: '2h' });
      return token;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }

  async validateUser(authentication: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(authentication, { secret });

      const user = await this.userService.getUser({
        _id: new Types.ObjectId(payload.userId),
      });

      return user;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
