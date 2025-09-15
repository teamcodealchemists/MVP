import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TelemetryService } from './telemetry.service';
import { InsertedOrdersGaugeProvider } from './telemetry.metrics';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    TelemetryService,
    InsertedOrdersGaugeProvider,  // 👈 importa qui
  ],
  exports: [TelemetryService],
})
export class TelemetryModule {}