import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Product extends AbstractDocument {
  @Prop({ unique: true })
  code: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  merchant: string;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Number, required: false })
  weight?: number;

  @Prop({ required: false })
  description?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
