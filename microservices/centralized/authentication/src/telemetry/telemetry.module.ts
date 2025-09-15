import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TelemetryService } from './telemetry.service';
import { loginAttemptsCounterProvider } from './telemetry.metrics';

@Module({
  imports: [PrometheusModule.register()],
  providers: [TelemetryService, loginAttemptsCounterProvider],
  exports: [TelemetryService],
})
export class TelemetryModule {}
