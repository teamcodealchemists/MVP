// NestJS core modules
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Services
import { AuthService } from './authentication.service';

// Controllers (INBOUND)
import { AuthController } from 'src/interfaces/auth.controller';
import { AccessControlController } from 'src/interfaces/accessControl.controller';
import { JwtController } from 'src/interfaces/jwt.controller';

// Infrastructure & Adapters
import { InboundPortsAdapter } from 'src/infrastructure/adapters/portAdapters/indboundPortsAdapter';
import { OutboundPortsAdapter } from 'src/infrastructure/adapters/portAdapters/outboundPortsAdapter';
import { NatsClientModule } from 'src/interfaces/nats/natsClientModule/natsClient.module';
import { AuthRepositoryModule } from 'src/interfaces/mongodb/auth.repository.module';
import { AuthRepositoryMongo } from 'src/interfaces/mongodb/auth.repository.impl';

// Event Handlers (OUTBOUND)
import { AuthEventHandler } from 'src/interfaces/authEvent.handler';

import { MongooseModule } from '@nestjs/mongoose';

// Telemetry
import { TelemetryModule } from 'src/telemetry/telemetry.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' }, // Corrisponde a Max-Age=3600
    }),
    NatsClientModule,
    TelemetryModule,
    AuthRepositoryModule,
  ],
  controllers: [AuthController, JwtController, AccessControlController],
  providers: [
    AuthService,
    InboundPortsAdapter,
    AuthEventHandler,
    OutboundPortsAdapter,
  ],
})
export class AuthModule {}
