
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

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';

@Injectable()
export class TelemetryService implements OnModuleInit {
  constructor(
    @InjectMetric('active_orders_gauge')
    private readonly activeOrdersGauge: Gauge<string>,
  ) {}

  // Imposta il valore della metrica
  setActiveOrders(count: number, warehouse: string) {
    this.activeOrdersGauge.set({ warehouse }, count);
  }

  // Genera dati fake ogni 10 secondi
  onModuleInit() {
    setInterval(() => {
      const fakeCount = Math.floor(Math.random() * 100); // 0 - 99
      this.setActiveOrders(fakeCount, 'A1');
      console.log(`Fake gauge updated: ${fakeCount} orders in warehouse A1`);
    }, 10000);
  }
}