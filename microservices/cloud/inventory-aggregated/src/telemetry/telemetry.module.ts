import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TelemetryService } from './telemetry.service';
import { inventoryProductsTotal } from './telemetry.metrics';

@Module({
  imports: [PrometheusModule.register()],
  providers: [TelemetryService, inventoryProductsTotal],
  exports: [TelemetryService],
})
export class TelemetryModule {}
