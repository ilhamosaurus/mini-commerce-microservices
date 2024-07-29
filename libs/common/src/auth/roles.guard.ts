import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }
    const user = this.getUser(context);

    return roles.includes(user.role);
  }

  private getUser(context: ExecutionContext) {
    let user: User;
    if (context.getType() === 'rpc') {
      user = context.switchToRpc().getData().user;
    } else if (context.getType() === 'http') {
      user = context.switchToHttp().getRequest().user;
    }

    if (!user) {
      throw new Error('No user provided in request');
    }
    return user;
  }
}
