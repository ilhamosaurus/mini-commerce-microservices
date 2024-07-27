import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  getHello(): string {
    return 'Hello World!';
  }

  order(data: any) {
    this.logger.log('order: ', data);
  }
}
