import { Injectable, NotFoundException } from '@nestjs/common';

export interface Order {
  id: string;
  item: string;
  status: 'shipped' | 'processing' | 'refunded';
  total: number;
}

/** The service an existing app would already have. It knows nothing about AI. */
@Injectable()
export class OrdersService {
  private readonly orders = new Map<string, Order>([
    ['ord_1', { id: 'ord_1', item: 'Mechanical keyboard', status: 'shipped', total: 129 }],
    ['ord_2', { id: 'ord_2', item: 'USB-C hub', status: 'processing', total: 49 }],
  ]);

  find(id: string): Order {
    const order = this.orders.get(id);
    if (!order) {
      throw new NotFoundException(`No order with id ${id}`);
    }
    return order;
  }

  refund(id: string): Order {
    const order = this.find(id);
    order.status = 'refunded';
    return order;
  }
}
