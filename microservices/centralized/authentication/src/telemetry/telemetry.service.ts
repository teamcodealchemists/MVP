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
import { Counter } from 'prom-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectMetric('login_attempts_total')
    private readonly loginAttemptsCounter: Counter<string>,
  ) {}

  trackLoginAttempt(email: string) {
    this.loginAttemptsCounter.inc({ email });
  }
}
