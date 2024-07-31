import {
  ACCOUNT_SERVICE,
  AUTH_SERVICE,
  CreateProductDto,
  LoginDto,
  PaymentDto,
  PRODUCT_SERVICE,
  RegisterDto,
  TopupDto,
  TRANSACTIONS_SERVICE,
  UpdateProductDto,
  User,
} from '@app/common';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { catchError, lastValueFrom, throwError } from 'rxjs';

@Injectable()
export class GatewayService {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(ACCOUNT_SERVICE) private readonly accountClient: ClientProxy,
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
    @Inject(TRANSACTIONS_SERVICE)
    private readonly transactionClient: ClientProxy,
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

  async getProducts(authentication: string) {
    try {
      const products = await lastValueFrom(
        this.productClient
          .send('get_products', {
            merchant_id: '',
            Authentication: authentication,
          })
          .pipe(
            catchError((val) => {
              if (val.code === 404) {
                return throwError(
                  () => new NotFoundException('Products not found'),
                );
              }
              return throwError(() => new InternalServerErrorException(val));
            }),
          ),
      );

      return products;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async getProductById(id: string, authentication: string) {
    try {
      const product = await lastValueFrom(
        this.productClient
          .send('get_product_by_id', { id, Authentication: authentication })
          .pipe(
            catchError((val) => {
              if (val.code === 404) {
                return throwError(
                  () => new NotFoundException('Product not found'),
                );
              }
              return throwError(() => new InternalServerErrorException(val));
            }),
          ),
      );

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async createProduct(dto: CreateProductDto, authentication: string) {
    try {
      const product = await lastValueFrom(
        this.productClient
          .send('create_product', { dto, Authentication: authentication })
          .pipe(
            catchError((val) => {
              if (val.code === 11000) {
                return throwError(
                  () =>
                    new ConflictException(`Product ${dto.code} already exists`),
                );
              }
              return throwError(() => new InternalServerErrorException(val));
            }),
          ),
      );

      return product;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    authentication: string,
  ) {
    try {
      const product = await lastValueFrom(
        this.productClient
          .send('update_product', { id, dto, Authentication: authentication })
          .pipe(
            catchError((val) => {
              if (val.code === 404) {
                return throwError(
                  () => new NotFoundException('Product not found'),
                );
              }
              return throwError(() => new InternalServerErrorException(val));
            }),
          ),
      );

      return product;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteProduct(id: string, authentication: string) {
    try {
      await this.productClient
        .send('delete_product', { id, Authentication: authentication })
        .pipe(
          catchError((val) => {
            if (val.error.code === 404) {
              return throwError(
                () => new NotFoundException('Product not found'),
              );
            }
            return throwError(() => new InternalServerErrorException(val));
          }),
        )
        .toPromise();

      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async payment(dto: PaymentDto, authentication: string) {
    try {
      const transaction = await lastValueFrom(
        this.transactionClient
          .send('payment', {
            dto,
            Authentication: authentication,
          })
          .pipe(
            catchError((val) => {
              if (val.error.code === 400) {
                return throwError(() => new BadRequestException(val.message));
              }
              if (val.error.code === 404) {
                return throwError(() => new NotFoundException(val.message));
              }
              return throwError(() => new InternalServerErrorException(val));
            }),
          ),
      );

      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async getTransactionsHistory(
    authentication: string,
    limit?: number,
    offset?: number,
  ) {
    try {
      const transactions = await lastValueFrom(
        this.transactionClient
          .send('get_transactions', {
            Authentication: authentication,
            limit,
            offset,
          })
          .pipe(
            catchError((val) => {
              if (val.error.code === 404) {
                return throwError(() => new NotFoundException(val.message));
              }
              return throwError(() => new InternalServerErrorException(val));
            }),
          ),
      );

      return transactions;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
}
