import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto, User } from '@app/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts() {
    return this.productRepository.find({});
  }

  async getProductByCode(code: string) {
    return this.productRepository.findOne({ code });
  }

  async getProductById(id: string) {
    return this.productRepository.findOne({ _id: id });
  }

  async createProduct(user: User, dto: CreateProductDto) {
    try {
      const product = await this.productRepository.create({
        code: dto.code.toUpperCase(),
        name: dto.name,
        price: dto.price,
        description: dto.description,
        weight: dto.weight,
        merchant: user.email,
      });

      return product;
    } catch (error) {
      if (error.code === 11000) {
        throw new RpcException({ ...error, product_code: dto.code });
      }
      throw new RpcException(error);
    }
  }

  async updateProduct(id: string, user: User, dto: CreateProductDto) {
    try {
      const product = await this.getProductById(id);
      if (!product) {
        throw new RpcException({ error: 'product not found', code: 404 });
      }
      if (product.merchant !== user.email) {
        throw new RpcException({ error: 'permission denied', code: 403 });
      }

      return this.productRepository.findOneAndUpdate({ _id: id }, dto);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async deleteProduct(id: string, user: User) {
    try {
      const product = await this.getProductById(id);
      if (!product) {
        throw new RpcException({ error: 'product not found', code: 404 });
      }
      if (product.merchant !== user.email) {
        throw new RpcException({ error: 'permission denied', code: 403 });
      }
      return this.productRepository.findOneAndDelete({ _id: id });
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
