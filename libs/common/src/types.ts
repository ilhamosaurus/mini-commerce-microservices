import { ApiProperty } from '@nestjs/swagger';

export type User = {
  _id: string;
  email: string;
  role: 'CLIENT' | 'MERCHANT';
};

export type Account = {
  _id: string;
  owner: string;
  balance: {
    $numberDecimal: string;
  };
};

export type Product = {
  _id: string;
  code: string;
  name: string;
  merchant: string;
  price: number;
  weight?: number;
  description?: string;
};

export class GetBalanceReponse {
  @ApiProperty({ type: String, description: "User's account id" })
  _id: string;
  @ApiProperty({ type: String, description: "User's Email" })
  owner: string;
  @ApiProperty({ type: String, description: 'User account balance' })
  balance: string;
}

export class ProductResponse {
  @ApiProperty({ type: String, description: "Product's automate generate id" })
  _id: string;
  @ApiProperty({ type: String, description: "Unique Product's code by user" })
  code: string;
  @ApiProperty({ type: String, description: "Product's name" })
  name: string;
  @ApiProperty({ type: String, description: 'Product owner' })
  merchant: string;
  @ApiProperty({ type: Number, description: "Product's price" })
  price: number;
  @ApiProperty({ type: Number, description: "Product's weight" })
  weight?: number;
  @ApiProperty({ type: String, description: "Product's description" })
  description?: string;
}

export class TransactionResponse {
  @ApiProperty({
    type: String,
    description: "Transaction's automate generate id",
    example: '5f9d9a9d9a9d9a9d9a9d9a9d',
  })
  _id: string;
  @ApiProperty({
    type: String,
    description: "Transaction's Unique invoice code",
    example: 'INV03082024-00001',
  })
  invoice: string;
  @ApiProperty({
    enum: ['TOPUP', 'PAYMENT', 'REVENUE'],
    description: "Transaction's type",
    example: 'PAYMENT',
  })
  type: 'TOPUP' | 'PAYMENT' | 'REVENUE';
  @ApiProperty({
    type: String,
    description: "Transaction's buyer",
    required: false,
    example: 'test@mail.com',
  })
  buyer?: string;
  @ApiProperty({
    type: String,
    description: "Transaction's merchant",
    required: false,
    example: 'test@mail.com',
  })
  merchant?: string;
  @ApiProperty({
    type: String,
    description: "Transaction's amount",
    example: 'Rp 103.900,08',
  })
  amount: string;
  @ApiProperty({
    type: String,
    description: "Transaction's description",
    required: false,
    example: 'test description',
  })
  description?: string;
  @ApiProperty({
    type: Date,
    description: "Transaction's created at",
    example: '2020-08-30T00:00:00.000Z',
  })
  created_at?: Date;
}
