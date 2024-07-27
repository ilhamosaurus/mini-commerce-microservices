import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { TokenPayload } from '../auth.service';
import { Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          const token = req?.Authentication;
          console.log('token: ', token);
          return token;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    console.log('userId', payload.userId);
    try {
      const user = await this.usersService.getUser({
        _id: new Types.ObjectId(payload.userId),
      });
      console.log('user', user);
      if (!user) {
        throw new RpcException('there is no user');
      }
      return user;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
