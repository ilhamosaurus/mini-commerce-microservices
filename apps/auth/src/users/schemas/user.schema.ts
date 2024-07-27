import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;
  //TODO: define role enum in mongoose
  @Prop({
    type: String,
    enum: ['CLIENT', 'MERCHANT'],
  })
  role: 'CLIENT' | 'MERCHANT';
}

export const UserSchema = SchemaFactory.createForClass(User);
