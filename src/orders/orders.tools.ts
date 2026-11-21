import { Injectable, UseGuards } from '@nestjs/common';
import { AgentFunction } from '@nestjs/ai';
import * as z from 'zod';
import { SupportOnlyGuard } from '../auth/support-only.guard.js';
import { OrdersService } from './orders.service.js';

const orderInput = z.object({ id: z.string().describe('The order id, such as ord_1') });
type OrderInput = z.infer<typeof orderInput>;

/** Step 3: provider methods the model may call as tools. */
@Injectable()
export class OrdersTools {
  constructor(private readonly orders: OrdersService) {}

  @AgentFunction({
    name: 'find-order',
    description: 'Find an order by its id',
    inputSchema: orderInput,
  })
  find({ id }: OrderInput) {
    return this.orders.find(id);
  }

  // Step 5: the guard runs on every call the model makes to this tool.
  @UseGuards(SupportOnlyGuard)
  @AgentFunction({
    name: 'refund',
    description: 'Refund an order by its id',
    inputSchema: orderInput,
  })
  refund({ id }: OrderInput) {
    return this.orders.refund(id);
  }
}
