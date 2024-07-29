import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { Product } from './schemas/product.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

@Injectable()
export class ProductRepository extends AbstractRepository<Product> {
  protected readonly logger = new Logger(ProductRepository.name);

  constructor(
    @InjectModel(Product.name) produtModel: Model<Product>,
    @InjectConnection() connection: Connection,
  ) {
    super(produtModel, connection);
  }
}
