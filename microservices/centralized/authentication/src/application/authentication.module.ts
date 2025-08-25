import { Module } from '@nestjs/common';
import { AuthService } from './authentication.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AuthService],
})
export class AuthModule {}
