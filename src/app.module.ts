import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { AiModule } from '@nestjs/ai';
import { DemoUserMiddleware } from './auth/demo-user.middleware.js';
import { SupportOnlyGuard } from './auth/support-only.guard.js';
import { defaultModel } from './models.js';
import { OrdersService } from './orders/orders.service.js';
import { OrdersTools } from './orders/orders.tools.js';
import { SupportController } from './support/support.controller.js';

@Module({
  imports: [
    // Step 2: register the models.
    AiModule.forRoot({
      models: { default: defaultModel() },
      defaults: { timeout: '30s', retry: { attempts: 3 } },
    }),
  ],
  controllers: [SupportController],
  providers: [OrdersService, OrdersTools, SupportOnlyGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DemoUserMiddleware).forRoutes('*');
  }
}
