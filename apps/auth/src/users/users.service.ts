import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { RegisterDto } from './dto/register.dto';
import { User } from './schemas/user.schema';
import { ACCOUNT_SERVICE } from '@app/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(ACCOUNT_SERVICE) private readonly accountClient: ClientProxy,
  ) {}

  async register(dto: RegisterDto) {
    // const sessions = await this.usersRepository.startTransaction();
    try {
      const user = await this.usersRepository.create({
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        role: dto.role,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...res } = user;
      await lastValueFrom(
        this.accountClient.emit('create_account', {
          user,
        }),
      );
      // await sessions.commitTransaction();
      return res;
    } catch (error) {
      if (error.message.includes('E11000')) {
        throw new RpcException(error);
      }
      // await sessions.abortTransaction();
      throw new RpcException(error);
    }
  }

  async validateLogin(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new RpcException('Invalid credentials');
    }
    return user;
  }

  async getUser(getUserArg: Partial<User>) {
    return this.usersRepository.findOne(getUserArg);
  }
}
