// src/application/state.module.ts
import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { StateRepositoryModule } from '../interfaces/mongodb/state.repository.module';

@Module({
  imports: [StateRepositoryModule],
  providers: [StateService],
  exports: [StateService],
})
export class StateModule {}
