// import { mock } from "node:test";
import * as nest from '@nestjs/core';
import { Transport } from "@nestjs/microservices";
import { StateAggregateModule } from "../../src/application/stateAggregate.module";
import { bootstrap } from '../../src/main';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    createMicroservice: jest.fn().mockResolvedValue({
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

describe("Test per main", () => {
    it('crea la microservice app con le opzioni corrette', async () => {
    // const {bootstrap } = await import('../../src/main.js');
    await bootstrap();

    expect(nest.NestFactory.createMicroservice).toHaveBeenCalledWith(
      StateAggregateModule,
      expect.objectContaining({
        transport: Transport.NATS,
        options: expect.objectContaining({
            servers: ['nats://nats:4222']
        }),
      })
    );
  });
});