export type User = {
  _id: string;
  email: string;
  role: 'CLIENT' | 'MERCHANT';
};

export type Account = {
  _id: string;
  owner: string;
  balance: number;
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
