import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Transaction extends AbstractDocument {
  @Prop()
  account_id: string;

  @Prop()
  invoice: string;

  @Prop({ enum: ['TOPUP', 'PAYMENT', 'REVENUE'] })
  type: 'TOPUP' | 'PAYMENT' | 'REVENUE';

  @Prop({ required: false })
  buyer?: string;

  @Prop({ required: false })
  merchant?: string;

  @Prop({ type: 'Decimal128' })
  amount: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Date, default: Date.now })
  created_at?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
