import { DynamicModule, Module } from '@nestjs/common';
import { RmqService } from './rmq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

interface RmqModuleOptions {
  names: string[];
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ names }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: names.map((name) =>
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RABBIT_MQ_URI')],
                queue: configService.get<string>(`RABBIT_MQ_${name}_QUEUE`),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ),
      exports: [ClientsModule],
    };
  }
}
