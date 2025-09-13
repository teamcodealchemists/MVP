import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TelemetryService } from './telemetry.service';
import { loginAttemptsCounter } from './telemetry.metrics';

@Module({
  imports: [PrometheusModule.register()],
  providers: [TelemetryService, loginAttemptsCounter],
  exports: [TelemetryService],
})
export class TelemetryModule {}
