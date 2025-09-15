
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

import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectMetric('inserted_orders_gauge')
    private readonly insertedOrdersGauge: Gauge<string>,
  ) {}

  // Imposta il valore della metrica
  setInsertedOrders(count: number, warehouse: number) {
    this.insertedOrdersGauge.inc({ warehouse: warehouse.toString() }, count);
  }

}