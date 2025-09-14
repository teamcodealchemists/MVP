/*
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectMetric('active_orders_gauge')
    private readonly activeOrdersGauge: Gauge<string>,
  ) {}

  setActiveOrders(count: number, warehouse: string) {
    this.activeOrdersGauge.set({ warehouse }, count);
  }
}

*/

import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectMetric('inventory_products_total')
    private readonly inventoryProductsTotal: Gauge<string>,
  ) {}

  setInventoryProductsTotal(warehouse: number, productId: string, value: number) {
    this.inventoryProductsTotal.set({ warehouse: warehouse.toString(), productId }, value);
  }
}
  