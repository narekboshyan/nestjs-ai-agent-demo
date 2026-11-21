import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { AiModule } from '@nestjs/ai';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { createAiOptions } from './ai/ai.config.js';
import { AuthModule } from './auth/auth.module.js';
import { DemoUserMiddleware } from './auth/demo-user.middleware.js';
import { validateEnv } from './config/env.js';
import { OrdersModule } from './orders/orders.module.js';
import { SupportModule } from './support/support.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    AiModule.forRootAsync({
      isGlobal: true,
      modelNames: ['default'],
      inject: [ConfigService],
      useFactory: createAiOptions,
    }),
    AuthModule,
    OrdersModule,
    SupportModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DemoUserMiddleware).forRoutes('*');
  }
}
