import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Topup extends AbstractDocument {
  @Prop()
  amount: number;
}

export const TopupSchema = SchemaFactory.createForClass(Topup);
