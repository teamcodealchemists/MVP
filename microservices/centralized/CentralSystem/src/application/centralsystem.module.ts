// NestJS core modules
import { Module } from '@nestjs/common';

// Services
import { CentralSystemService } from './centralsystem.service';

// Controllers (INBOUND)
import { centralSystemController } from 'src/interfaces/centralSystemController';

// Infrastructure & Adapters
import { InboundPortsAdapter } from 'src/infrastructure/adapters/InboundPortsAdapter';
import { OutboundPortsAdapter } from 'src/infrastructure/adapters/centralSystemEventAdapter';
import { NatsClientModule } from 'src/interfaces/nats/natsClientModule/natsClient.module';

// Event Handlers (OUTBOUND)
import { centralSystemHandler } from 'src/interfaces/centralSystem.handler';

@Module({
  imports: [
    NatsClientModule,
  ],
  controllers: [centralSystemController],
  providers: [
    CentralSystemService,
    InboundPortsAdapter,
    OutboundPortsAdapter,
    centralSystemHandler,
  ],
})
export class CentralSystemModule {}