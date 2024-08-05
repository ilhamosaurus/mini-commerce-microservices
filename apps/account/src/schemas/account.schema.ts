import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Account extends AbstractDocument {
  @Prop()
  owner: string;

  @Prop({ type: 'Decimal128', default: 0 })
  balance: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
