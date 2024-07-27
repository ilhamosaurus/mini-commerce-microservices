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
