import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OrdersService } from './orders.service.js';
import { OrdersTools } from './orders.tools.js';

@Module({
  imports: [AuthModule],
  providers: [OrdersService, OrdersTools],
  exports: [OrdersService],
})
export class OrdersModule {}
