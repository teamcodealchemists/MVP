import { Module } from '@nestjs/common';
import { AuthService } from './authentication.service';
import { AuthController } from 'src/interfaces/auth.controller';
import { InboundPortsAdapter } from 'src/infrastructure/portAdapters/indboundPortsAdapter';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, InboundPortsAdapter],
})
export class AuthModule {}
