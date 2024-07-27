import { LoginDto, RegisterDto, TopupDto, User } from '@app/common';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { catchError, lastValueFrom, throwError } from 'rxjs';

@Injectable()
export class GatewayService {
  constructor(
    @Inject('AUTH') private readonly authClient: ClientProxy,
    @Inject('ACCOUNT') private readonly accountClient: ClientProxy,
  ) {}

  async register(dto: RegisterDto) {
    const user: User = await lastValueFrom(
      this.authClient.send('register_user', dto).pipe(
        catchError((val) => {
          if (val.code === 11000) {
            return throwError(
              () => new ConflictException('User already exists'),
            );
          }

          return throwError(() => new InternalServerErrorException(val));
        }),
      ),
    );

    return user;
  }

  async login(dto: LoginDto, res: Response) {
    try {
      const token = await lastValueFrom(
        this.authClient.send('login', dto).pipe(
          catchError((val) => {
            return throwError(() => new InternalServerErrorException(val));
          }),
        ),
      );
      const expires = new Date();
      expires.setSeconds(expires.getSeconds() + 7200);

      res.cookie('Authentication', token, { expires, httpOnly: true });

      return res.status(200).json({ access_token: token });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBalance(authentication: string) {
    try {
      const balance = await lastValueFrom(
        this.accountClient
          .send('get_balance', { Authentication: authentication })
          .pipe(
            catchError((val) => {
              return throwError(() => new InternalServerErrorException(val));
            }),
          ),
      );

      return balance;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async topup(dto: TopupDto, authentication: string) {
    try {
      const account = await lastValueFrom(
        this.accountClient
          .send('topup', {
            dto,
            Authentication: authentication,
          })
          .pipe(
            catchError((val) => {
              return throwError(() => new InternalServerErrorException(val));
            }),
          ),
      );

      return account;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
